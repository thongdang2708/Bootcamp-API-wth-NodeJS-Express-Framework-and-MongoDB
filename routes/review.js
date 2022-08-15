
const express = require("express");

const {addReview, getNumberOfReviews, getSingleReview, updateReview, deleteReview} = require("../controllers/review");
const {protect, roleAuthorization} = require("../middleware/auth");

const router = express.Router({ mergeParams: true});

router.route("/").get(getNumberOfReviews).post(protect, roleAuthorization("user", "admin"), addReview);

router.route("/:id").get(getSingleReview).put(protect, roleAuthorization("user", "admin"), updateReview).delete(protect, roleAuthorization("user", "admin"), deleteReview);

module.exports = router;