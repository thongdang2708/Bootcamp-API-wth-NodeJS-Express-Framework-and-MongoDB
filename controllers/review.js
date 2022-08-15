
const Review = require("../models/review");
const Bootcamp = require("../models/bootcamp");
const ErrorResponse = require("../utils/errorResponse");
//@desc        Add a review
//@route       POST /api/v1/bootcamps/:bootcampId/reviews
//@access      public

exports.addReview = async (req, res, next) => {

    try {

        req.body.bootcamp = req.params.bootcampId;
        req.body.user = req.user.id;

        let bootcamp = await Bootcamp.findById(req.params.bootcampId);

        if (!bootcamp) {
            return next(new ErrorResponse("This bootcamp cannot be found", 404));
        };

        let review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            data: review
        });


    } catch (err) {
        next(err);
    }
};

//@desc        Get all reviews or number of reviews of bootcamps
//@route       GET    /api/v1/reviews
//@route       GET    /api/v1/bootcamps/:bootcampId/reviews
//@access      Private

exports.getNumberOfReviews = async (req, res, next) => {

    try {

        let review;

        if (req.params.bootcampId) {
            review = Review.find({bootcamp: req.params.bootcampId});
        } else {
            review = Review.find();
        };

        let reviews = await review;

        res.status(200).json({
            success: true,
            data: reviews
        });

    } catch (err) {
        next(err);
    }
};

//@desc         Get single review
//@route        GET     /api/v1/reviews/:id
//@access       Private

exports.getSingleReview = async (req, res, next) => {
    
    try { 

        let review = await Review.findById(req.params.id);

        res.status(200).json({
            success: true,
            data: review
        })


    } catch (err) {
        next(err);
    }
};

//@desc              Update Review
//@route             PUT   /api/v1/reviews/:id
//@access            Private

exports.updateReview = async (req, res, next) => {

    try {

        let review = await Review.findById(req.params.id);

        if (!review) {
            return next(new ErrorResponse("No review can be found", 404))
        };

        if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
            return next(new ErrorResponse("This user is not allowed to update this review", 401))
        };

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: review
        })


    } catch (err) {
        next(err);
    }
};

//@desc           Delete review
//@route          DELETE   /api/v1/reviews/:id
//@access         Private

exports.deleteReview = async (req, res, next) => {

    try {

        let review = await Review.findById(req.params.id);

        if (!review) {
            return next(new ErrorResponse("This review cannot be found", 404));
        };

        if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
            return next(new ErrorResponse("This user is not allowed delete this review", 401))
        };

        await review.remove();

        res.status(200).json({
            success: true,
            data: {}
        })
    } catch (err) {
        next(err);
    }
}








