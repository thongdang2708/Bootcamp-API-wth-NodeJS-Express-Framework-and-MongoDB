
const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {

    console.log(err.stack.red);

    let error = err;

    if (err.name === "CastError") {
        let message = `Bootcamp not found with ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    if (err.code === 11000) {
        let message = "There is a duplicate value";
        error = new ErrorResponse(message, 400);
    }
    
    if (err.name === "ValidationError") {
        let message = Object.values(err.errors).map(val => val.properties.message);
        error = new ErrorResponse(message, 400);
    }

    console.log(err);
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message
    })
}

module.exports = errorHandler;


