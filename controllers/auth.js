
const processNested = require("express-fileupload/lib/processNested");
const User = require("../models/user");
const { use } = require("../routes/auth");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { resolveSoa } = require("dns");
//@desc         REGISTER
//@route        POST    /api/v1/auth/register
//@access       Public

exports.register = async (req, res, next) => {

    try {

    let {name, email, role, password} = req.body;

    let user = await User.create({
        name,
        email,
        role,
        password
    });

    let token = user.getSignedJwtToken();

    res.status(200).json({
        success: true,
        token
    })

    } catch (err) {
        next(err);
    }
};

//@desc         Log in
//@route        POST /api/v1/auth/login
//@access       Public

exports.login = async (req, res, next) => {

    try {

        let {email, password} = req.body;

        if (!email || !password) {
            return next(new ErrorResponse("Please fill information", 400))
        };

        let user = await User.findOne({email: email}).select("+password");

        if (!user) {
            return next(new ErrorResponse("Invalid Credentials", 401))
        };

        let isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return next(new ErrorResponse("Invalid Credentials", 401));
        };

        sendTokenResponse(user, 200, res);
        

    } catch (err) {
        next(err);
    }
};

const sendTokenResponse = (user, statusCode, res) => {

    let token = user.getSignedJwtToken();

    let options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === "production") {
        options.secure = true
    };

    res.status(statusCode)
        .cookie("token", token, options)
        .json({
            success: true,
            token
        })
};

exports.getMe = async (req, res, next) => {

    try {

        let user = await User.findById(req.user.id);

        if (!user) {
            return next(new ErrorResponse("This user is not found", 404))
        };

        res.status(200).json({
            success: true,
            user: user
        })

    
    } catch (err) {
        next(err);
    }
};

//@desc         Forget Password
//@route        POST    /api/v1/auth/forgetpassword
//@access       Public

exports.forgetPassword = async (req, res, next) => {

    try {

        let user = await User.findOne({ email: req.body.email});

        if (!user) {
            return next(new ErrorResponse("There is no user with this email", 404))
        }

        let resetToken = user.getResetToken();

        await user.save({ validateBeforeSave: false});

        let resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;

        let message = `You have requested this reset password. Please update via a link: ${resetURL}`;

        try {

            await sendEmail({
                email: user.email,
                subject: "Reset Password Token",
                message: message
            })

            res.status(200).json({
                success: true,
                message: "Email sent"
            })

        } catch (err) {
            
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false});

            return next(new ErrorResponse("Email Problem", 500));
        }


    } catch (err) {
        next(err);
    }
};

//@desc         Reset Password
//@route        PUT  /api/v1/auth/resetpassword/:resettoken
//@access       Public

exports.resetPassword = async (req, res, next) => {

    try {

        let resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex");

        let user = await User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: {$gt: Date.now()}
        });

        if (!user) {
            return next(new ErrorResponse("Invalid Token", 400))
        };

        user.password = req.body.newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false});

        sendTokenResponse(user, 200, res);

    } catch (err) {
        next(err);
    }
};

//@desc          Update details
//@route         PUT   /api/v1/auth/updatedetails
//access         Private

exports.updateDetails = async (req, res, next) => {

    try {

        let fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email
        };

        let user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });


    } catch (err) {
        next(err)
    }
};

//@desc         Update Password
//@route        PUT    /api/v1/auth/updatepassword
//@access       Private


exports.updatePassword = async (req, res, next) => {

    try {

        let user = await User.findById(req.user.id).select("password");

        if (!(await user.matchPassword(req.body.currentPassword))) {
            return next(new ErrorResponse("Password is incorrect", 401))
        };

        user.password = req.body.newPassword;

        await user.save({ validateBeforeSave: false });

        sendTokenResponse(user, 200, res);

    } catch (err) {
        next(err);
    }
};


//@desc            Log Out
//@route           GET     /api/v1/auth/logout
//@access          Log Out

exports.logOut = async (req, res, next) => {

    try {

        res.cookie("token", "none", {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            data: {}
        });

    } catch (err) {
        next(err);
    }
};



















































// //@desc          Forget password
// //@route         POST   /api/v1/auth/forgetpassword
// //@access        Public


// exports.forgetPassword = async (req, res, next) => {

//     try {

//        let user = await User.findOne({ email: req.body.email});

//        if (!user) {
//            return next(new ErrorResponse("This user cannot be found with this email", 404));
//        };

//        let resetToken = user.getResetToken();

//        await user.save({ validateBeforeSave: false});

//        let resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;

//        let message = `You have requested this reset. Please update at ${resetURL}`;

//        try {

//          await sendEmail({
//              email: user.email,
//              subject: "Reset Password",
//              message: message
//          })

//          res.status(200).json({
//              success: true,
//              message: "Email sent"
//          })
//        } catch (err) {

//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;

//         await user.save({ validateBeforeSave: false});

//         return next(new ErrorResponse(`Email Problem`, 500))
//        }
     
//        res.status(200).json({
//            success: true,
//            data: user
//        })
//     } catch (err) {
//         next(err);
//     }
// };

// //@desc         Reset Password
// //@route        PUT    /api/v1/auth/resetpassword/:resettoken
// //@access       Public

// exports.resetPassword = async (req, res, next) => {

//     try {

//         let resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex");

//         let user = await User.findOne({
//             resetPasswordToken: resetPasswordToken,
//             resetPasswordExpire: {$gt: Date.now()}
//         });

//         if (!user) {
//             return next(new ErrorResponse("Invalid Token", 400));
//         };

//         user.password = req.body.newPassword;
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;

//         await user.save({ validateBeforeSave: false});

//         sendTokenResponse(user, 200, res);

//     } catch (err) {
//         next(err);
//     }
// }




























































