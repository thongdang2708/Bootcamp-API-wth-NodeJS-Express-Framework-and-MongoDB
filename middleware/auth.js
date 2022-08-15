
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.protect = async (req, res, next) => {

    try {

        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1]
        };

        if (req.cookies.token) {
            token = req.cookies.token;
        };
        
        if (!token) {
            return next(new ErrorResponse("Not allowed to access this route", 401))
        };

        try {

            let decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id);
            
            next();

        } catch (err) {
            return next(new ErrorResponse("Not allowed to access this route", 401))
        }

    } catch (err) {
        next(err);
    }
};

exports.roleAuthorization = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`This user with ${req.user.id} is not allowed to access this route`, 403))
        }
        next();
    }
}