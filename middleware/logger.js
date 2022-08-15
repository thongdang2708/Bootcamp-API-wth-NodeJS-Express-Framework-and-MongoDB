
const logger = (req, res, next) => {

    req.user = "Thong Dang";

    console.log("Middleware ran");
    next();
};

module.exports = logger;