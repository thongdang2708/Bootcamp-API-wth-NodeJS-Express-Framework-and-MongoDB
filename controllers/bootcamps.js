
const Bootcamp = require("../models/bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");
const path = require("path");
const { nextTick } = require("process");

//@desc        GET ALL BOOTCAMPS
//@route        GET    /api/v1/bootcamps
//@access       PUBLIC

exports.getAllBootcamps = async (req, res, next) => {
    
    try {

        
        // let convertedObject = Object.entries(req.query)[0].map((item, index) => {
        //     if (index === 0) {
        //         return item.toLowerCase();
        //     } else {
        //         return item
        //     }
        // });

        // let originalObject = Object.fromEntries([convertedObject]);

    

        // console.log(originalObject);
        
        let requestQuery = {...req.query};

        let deleteKeys = ["select", "sort", "page", "limit"];

        deleteKeys.forEach((val) => delete requestQuery[val]);

        let queryString = JSON.stringify(requestQuery);

        queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        let queryParse = JSON.parse(queryString);

        let query = Bootcamp.find(queryParse).populate("course");

        if (req.query.select) {
            let fields = req.query.select.split(",").join(" ");
            query = query.select(fields);
        }

        if (req.query.sort) {
            let fields = req.query.select.split(",").join(" ");
            query = query.sort(fields);
        } else {
            query = query.sort("createAt");
        }

        
        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 1;
        let startIndex = (page - 1) * limit;
        let endIndex = page * limit;
        let total = await Bootcamp.countDocuments();

        query = query.skip(startIndex).limit(limit);
        
        let bootcamps = await query;

        let pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit: limit
            }
        };

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit: limit
            }
        }
     

        
        res.status(200).json({
            success: true,
            data: bootcamps
        })

    } catch (err) {
        next(err);
    }


}


//@desc        GET BOOTCAMPS BY ID
//@route       GET /api/v1/bootcamps/:id
//@access       PUBLIC

exports.getSingleBootcamp = async (req, res, next) => {

    try {

        let bootcamp = await Bootcamp.findById(req.params.id);

        if (!bootcamp) {
           return next(new ErrorResponse(`Bootcamp is not found with ${req.params.id}`, 404));
        }

        res.status(200).json({
            success: true,
            data: bootcamp
        })
    } catch (err) {
        next(err);
    }
}

//@desc         Get bootcamps within a radius
//@route        GET    /api/v1/bootcamps/radius/:zipcode/:distance
//@access       PUBLIC

exports.getBootcampsByRadius = async (req, res, next) => {

    try {

        let { zipcode, distance} = req.params;

        let loc = await geocoder.geocode(zipcode);

        // Longitude and latitude

        let longitude = loc[0].longitude;
        let latitude = loc[0].latitude;

        //Calc radius

        let radius = distance / 3963;

        //Find Bootcamps

        let bootcamp = await Bootcamp.find({
            location: {
                $geoWithin: { $centerSphere: [ [ longitude, latitude ], radius ] }
             }
        });

        res.status(200).json({
            success: true,
            count: bootcamp.length,
            data: bootcamp
        })
     

    } catch (err) {
        console.error(err);
    }



}







//@desc         CREATE A NEW BOOTCAMP
//@route        POST    /api/v1/bootcamps
//@access       PRIVATE

exports.createBootcamp = async (req, res, next) => {

    try {

        req.body.user = req.user.id;

        let publishedBootcamp = await Bootcamp.findOne({user: req.user.id});

        if (publishedBootcamp && req.user.role !== "admin") {
            return next(new ErrorResponse(`This user ${req.user} is not allowed to publish a bootcamp`, 400))
        };

        let bootcamp = await Bootcamp.create(req.body);

        res.status(201).json({
            success: true,
            data: bootcamp
        })

    } catch (err) {
        next(err);
    }


};



//@desc          Update a bootcamp
//@route         UPDATE  /api/v1/bootcamps/:id
//@access        PRIVATE

exports.updateBootcamp = async (req, res, next) => {

    try {

        let bootcamp = await Bootcamp.findById(req.params.id);

        if (!bootcamp) {
            return next(new ErrorResponse(`This bootcamp ${req.params.id} cannot be found`, 404))
        };

        if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
            return next(new ErrorResponse(`This user ${req.user.id} is not allowed to update this course`, 401))
        };

        bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: bootcamp
        })

        

    } catch (err) {
        next(err);
    }
   
}



//@desc         DELETE A BOOTCAMP
//@route        DELETE /api/v1/bootcamps/:id
//@access       PRIVATE

exports.deleteBootcamp = async (req, res, next) => {

    try { 

        let bootcamp = await Bootcamp.findById(req.params.id);

        if (!bootcamp) {
            return next(new ErrorResponse(`This bootcamp ${req.params.id} cannot be found`, 404))
        };

        if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
            return next(new ErrorResponse(`This user ${req.user.id} is not allowed to delete this bootcamp`, 401));
        };

        await bootcamp.remove();

        res.status(200).json({
            success: true,
            data: {}
        })

        


    } catch (err) {
        next(err);
    }
   
};  

//@desc         Upload a photo for bootcamp
//@route        PUT    /api/v1/bootcamps/:id/photo
//@access       Private

exports.uploadPhotos = async (req, res, next) => {


    try {

        let bootcamp = await Bootcamp.findById(req.params.id);

        if (!bootcamp) {
            return next(new ErrorResponse(`Cannot find id of ${req.params.id}`, 404))
        };

        if (!req.files) {
            return next(new ErrorResponse("Please upload a file", 400));
        };

        let file = req.files.file

        if (!file.mimetype.startsWith("image")) {
            return next(new ErrorResponse("Please upload an image file", 400))
        };

        if (file.size > process.env.MAX_FILE_SIZE) {
            return next(new ErrorResponse(`Please upload a file less than ${process.env.MAX_FILE_SIZE}`, 400))
        };

        file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
            if (err) {
                console.error(err);
                return next(new ErrorResponse("Problem with file upload", 500))
            } else {
                
                await Bootcamp.findByIdAndUpdate(bootcamp._id, {
                    photo: file.name
                });

                res.status(200).json({
                    success: true,
                    data: file.name
                })
            }
        })

        

    } catch (err) {
        next(err);
    }
}














































// exports.deleteBootcamp = async (req, res, next) => {

//     try {

//         let bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

//        if (!bootcamp) {
//            return res.status(400).json({
//                success: false
//            })
//        };

//        res.status(200).json({
//             success: true,
//             data: {}
//        })
//     } catch (err) {
//         res.status(400).json({
//             success: false
//         })
//     }
// }

// exports.updateBootcamp = async (req, res, next) => {

//     try {

//         let bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true
//         });

//         if (!bootcamp) {
//             return res.status(400).json({
//                 success: false
//             })
//         };

//         res.status(200).json({
//             success: true,
//             data: bootcamp
//         })

//     } catch (err) {
//         res.status(400).json({
//             success: false
//         })
//     }
// }



// exports.getAllBootcamps = async (req, res, next) => {
    
//     try {

//         let bootcamp = await Bootcamp.find();

//         res.status(200).json({
//             success: true,
//             count: bootcamp.length,
//             data: bootcamp
//         })

//     } catch (err) {
//         res.status(400).json({
//             success: false
//         })
//     }

// };

// exports.getSingleBootcamp = async (req, res, next) => {

//     try {

//         let bootcamp = await Bootcamp.findById(req.params.id);

//         if (!bootcamp) {
//            return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
//         };

//         res.status(200).json({
//             success: true,
//             data: bootcamp
//         })

//     } catch (err) {
//         next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
//     }
    
// }



// exports.createBootcamp = async (req, res, next) => {

//     try {

//         let bootcamp = await Bootcamp.create(req.body);

//         res.status(201).json({
//             success: true,
//             data: bootcamp
//         })

//     } catch (err) {
//         res.status(400).json({
//             success: false
//         })
//     }

// }

// let requestQuery = {...req.query};

// let deleteKeys = ["select"];

// deleteKeys.forEach((val) => delete requestQuery[val]);

// let queryString = JSON.stringify(requestQuery);

// queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

// let queryParse = JSON.parse(queryString);

// let query = Bootcamp.find(queryParse);

// if (req.query.select) {
//     let fields = req.query.select.split(",").join(" ");
//     query = query.select(fields);
// };

// if (req.query.sort) {
//     let fields = req.query.sort.split(",").join(" ");
//     query = query.sort(fields);
// } else {
//     query = query.sort("-createAt");
// }


// let bootcamps = await query;


// let page = parseInt(req.query.page, 10) || 1;
//         let limit = parseInt(req.query.limit, 10) || 2;
//         let startIndex = (page - 1) * limit;
//         let endIndex = page * limit;
//         let total = await Bootcamp.countDocuments();

//         query = query.skip(startIndex).limit(endIndex);




// //@desc      Upload a photo for bootcamp
// //@route     PUT    /api/v1/bootcamps/:id/photo
// //@access    Private

// exports.uploadPhotos = async (req, res, next) => {

//     try {
        
//         let bootcamp = await Bootcamp.findById(req.params.id);

//         if (!bootcamp) {
//             return next(new ErrorResponse(`Cannot find id of ${req.params.id}`, 404))
//         };

//         if (!req.files) {
//             return next(new ErrorResponse("Please upload a file", 400));
//         };

//         let file = req.files.file;
        
//         if (!file.mimetype.startsWith("image")) {
//             return next(new ErrorResponse("Please upload an image file", 400));
//         };

//         if (file.size > process.env.MAX_FILE_SIZE) {
//             return next(new ErrorResponse(`Please upload a file with size less than ${process.env.MAX_FILE_SIZE}`, 400))
//         };

//         file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

//         file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
//             if (err) {
//                 console.error(err);
//                 return next(new ErrorResponse("Problem with file upload", 500))
//             } else {
                
//                 await Bootcamp.findByIdAndUpdate(req.params.id, {
//                     photo: file.name
//                 });

//                 res.status(200).json({
//                     success: true,
//                     data: file.name
//                 })
//             }
//         });

//     } catch (err) {
//         next(err);
//     }
// } 



