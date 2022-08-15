

const express = require("express");

const {getAllBootcamps, getSingleBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsByRadius, uploadPhotos} = require("../controllers/bootcamps");

const {protect, roleAuthorization} = require("../middleware/auth");

const courseRouter = require("./courses");

const reviewRouter = require("./review");

const router = express.Router();

router.use("/:bootcampId/reviews", reviewRouter);
router.use("/:bootcampId/courses",courseRouter);
router.route("/radius/:zipcode/:distance").get(getBootcampsByRadius);

router.route("/") 
        .get(getAllBootcamps)
        .post(protect, roleAuthorization("publisher", "admin"),createBootcamp);

router.route("/:id")
        .get(getSingleBootcamp)
        .put(protect, roleAuthorization("publisher", "admin"), updateBootcamp)
        .delete(protect, roleAuthorization("publisher", "admin"), deleteBootcamp);

router.route("/:id/photo").put(uploadPhotos);

module.exports = router;