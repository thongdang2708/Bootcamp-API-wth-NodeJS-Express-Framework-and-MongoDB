
const User = require("../models/user");
const ErrorResponse = require("../utils/errorResponse");

//@desc       Get users
//@route      GET   /api/v1/users
//@access     Public

exports.getAllUsers = async (req, res, next) => {

    try {

        let user = await User.find();

        res.status(200).json({
            success: true,
            data: user
        })
         
    } catch (err) {
        next(err);
    }
};

//@desc            Get Single User
//@route           Get /api/v1/user/:id
//@access          Private

exports.getSingleUser = async (req, res, next) => {

    try {

        let user = await User.findById(req.params.id);

        if (!user) {
            return next(new ErrorResponse("This user cannot be found", 404))
        };

        res.status(200).json({
            success: true,
            data: user
        })
    } catch (err) {
        next(err);
    }
}

//@desc           Add User
//@route          POST  /api/v1/user
//@access         Private

exports.addUser = async (req, res, next) => {

    try {

        let user = await User.create(req.body);

        res.status(201).json({
            success: true,
            data: user
        })

    } catch (err) {
        next(err);
    }
};

//@desc          Update User
//@route         PUT    /api/v1/user/:id
//@access        Private

exports.updateUser = async (req, res, next) => {

    try {

        let user = await User.findByIdAndUpdate(req.params.id);

        if (!user) {
            return next(new ErrorResponse("This user cannot be found", 404))
        };

        res.status(201).json({
            success: true,
            data: user
        });


    } catch (err) {
        next(err);
    }
};


//@desc        Delete Password
//@route       Delete /api/v1/auth/deletepassword
//@access      Private

exports.deleteUser = async (req, res, next) => {
    
    try {

        let user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return next(new ErrorResponse("This user cannot be found", 404));
        };

        res.status(200).json({
            success: true,
            data: user
        })
    } catch (err) {
        next(err);
    }
}



      