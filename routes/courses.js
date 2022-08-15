
const express = require("express");
 
const { getCourses, getBootcampsByCourse, getSingleCourse, updateCourse, createNewCourse, createBootcampViaCourseid, deleteCourse} = require("../controllers/courses");

const {protect, roleAuthorization} = require("../middleware/auth");

const router = express.Router({ mergeParams: true});


router.route("/").get(getCourses).post(protect, roleAuthorization("publisher", "admin"),createNewCourse);
router.route("/:courseId/bootcamps").get(getBootcampsByCourse).post(protect, roleAuthorization("publisher", "admin"), createBootcampViaCourseid);
router.route("/:id").get(getSingleCourse).put(protect, roleAuthorization("publisher", "admin"), updateCourse).delete(protect, roleAuthorization("publisher", "admin"), deleteCourse);    


module.exports = router;

