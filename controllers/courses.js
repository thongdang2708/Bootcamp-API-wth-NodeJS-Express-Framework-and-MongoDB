
const Course = require("../models/course");
const Bootcamp = require("../models/bootcamp");
const ErrorResponse = require("../utils/errorResponse");
//@desc     Get all courses or courses of one bootcamp
//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//access    Public

exports.getCourses = async (req, res, next) => {

    try {

        let query;

        if (req.params.bootcampId) {
            query = Course.find({ bootcamp: req.params.bootcampId})
        } else {
            query = Course.find().populate("bootcamp");
        };
    
        let courses = await query;

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })

    } catch (err) {
        next(err);
    }
};

//@desc        Get bootcamps by a course
//@route       GET /api/v1/courses/:courseId/bootcamps
//@access       Public

exports.getBootcampsByCourse = async (req, res, next) => {

    try {

        let bootcamps = await Bootcamp.find({ courseID: req.params.courseId});

        if (!bootcamps) {
            return next(new ErrorResponse("Cannot find", 404))
        }

        res.status(200).json({
            success: true,
            data: bootcamps
        })
    } catch (err) {
        next(err)
    }
}

//@desc     Get a single course
//@route    Get     /api/v1/courses/:id
//@access   Private

exports.getSingleCourse = async (req, res, next) => {

    try {

        let course = await (await Course.findById(req.params.id)).populate("bootcampInfo");

        if (!course) {
            return next(new ErrorResponse("Cannot find", 404))
        };

        res.status(200).json({
            success: true,
            data: course
        })

    } catch (err) {
        next(err);
    }
}

//@desc      Create a new course
//@route     POST /api/v1/bootcamps/:bootcampId/courses
//@access    Private

exports.createNewCourse = async (req, res, next) => {


    try {

        req.body.bootcamp = req.params.bootcampId;
        req.body.user = req.user.id;

        let bootcamp = await Bootcamp.findById(req.params.bootcampId);

        if (!bootcamp) {
            return next(new ErrorResponse(`This bootcamp ${req.params.bootcampId} cannot be found`, 404))
        };

        if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
            return next(new ErrorResponse(`This user ${req.user.id} is not allowed to add this course`, 401))
        };

        let course = await Course.create(req.body);

        res.status(200).json({
            success: true,
            data: course
        });
        

    } catch (err) {
        next(err);
    }
   
};

//@desc         Create a new bootcamp via courseId
//@route        POST    /api/v1/courses/:courseId/bootcamps
//@access       Private

exports.createBootcampViaCourseid = async (req, res, next) => {

    try {

       req.body.courseID = req.params.courseId;

       let course = await Course.findById(req.params.courseId);

       if (!course) {
           return next(new ErrorResponse("Cannot Find", 404))
       };

       let bootcamp = await Bootcamp.create(req.body);

       res.status(201).json({
           success: true,
           data: bootcamp
       });

    } catch (err) {
        next(err);
    }
};


//@desc         Update a course
//@route        PUT    /api/v1/courses/:id
//@access       Private

exports.updateCourse = async (req, res, next) => {

    try {

        let course = await Course.findById(req.params.id);

        if (!course) {
            return next(new ErrorResponse(`This course ${req.params.id} cannot be found`, 404))
        };

        if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
            return next(new ErrorResponse(`This user ${req.user.id} is not allowed to update this course`, 401))
        };

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: course
        })


    } catch (err) {
        next(err);
    }
    
};

//@desc        Delete a course
//@route       DELETE   /api/v1/courses/:id
//@access      Private

exports.deleteCourse = async (req, res, next) => {

    try {

        let course = await Course.findById(req.params.id);

        if (!course) {
            return next(new ErrorResponse(`This course ${req.params.id} cannot be found`, 404))
        };

        if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
            return next(new ErrorResponse(`This user ${req.user.id} is not allowed to delete this course`, 401))
        };

        await course.remove();

        res.status(200).json({
            success: true,
            data: {}
        });



    } catch (err) {
        next(err);
    }
}






































































//@desc Get all courses or courses by bootcamp ID
//@route        GET /api/v1/courses
//@route        GET /api/v1/bootcamps/:bootcampId/courses
//@access       Public





// exports.getCourses = async (req, res, next) =>  {

//     try {

//         let query;

//         if (req.params.bootcampId) {
//             query = Course.find({ bootcamp: req.params.bootcampId});
//         } else {
//             query = Course.find();
//         };

//         let courses = await query;

//         res.status(200).json({
//             success: true,
//             count: courses.length,
//             data: courses
//         })


//     } catch (err) {
//         next(err);
//     }
// };

// //@desc     Get courses by courseId
// //@route    Get /api/v1/courses/:id
// //@access   Public

// exports.getCourseById = async (req, res, next) => {

//     try {

//         let courses = await Course.findById(req.params.id).populate({
//             path: "bootcamp",
//             select: "name description"
//         });

//         if (!courses) {
//             return next(new ErrorResponse(`Course is not found with ${req.params.id}`, 404))
//         }

//         res.status(200).json({
//             success: true,
//             data: courses,
//         })

//     } catch (err) {
//         next(err);
//     }
// };




// exports.createNewBootcampViaCourse = async (req, res, next) => {

//     try {

//         req.body.courseID = req.params.courseId;

//         let course = await Course.findById(req.params.courseId);

//         if (!course) {
//             return next(new ErrorResponse("Cannot find", 404))
//         };

//         let bootcamp = await Bootcamp.create(req.body);

//         res.status(201).json({
//             success: true,
//             data: bootcamp
//         })


//     } catch (err) {
//         next(err);
//     }
// };


// exports.deleteCourse = async (req, res, next) => {

//     try {
 
//      let course = await Course.findById(req.params.id);
 
//      if (!course) {
//          return next(new ErrorResponse("Cannot find", 404))
//      };
 
//      await Bootcamp.deleteMany({ courseID: req.params.id});
//      await course.remove();
     
     
//      res.status(200).json({
//          success: true,
//          data: {}
//      })
//     } catch (err) {
//         next(err);
//     }
//  };
 