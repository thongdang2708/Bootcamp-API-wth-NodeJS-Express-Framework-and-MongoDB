
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bootcamps = require("./routes/bootcamps");
const morgan = require("morgan");
const connectDB = require("./config/db");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const courses = require("./routes/courses");
const fileupload = require("express-fileupload");
const { application } = require('express');
const path = require("path");
const auth = require("./routes/auth");
const user = require("./routes/user");
const review = require("./routes/review");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
//Load Global Environment
dotenv.config({path: "./config/config.env"});

connectDB();

const PORT = process.env.PORT || 8000;

// Express JSON
app.use(express.json());


if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}


app.use(fileupload());

// Mongo Sanitize
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

//Set Limit

let limiter = rateLimit({
    windowMS: 10 * 60 * 1000,
    max: 100
});

app.use(limiter);

// Prevent HTTP param pollution
app.use(hpp());

app.use(express.static(path.join(__dirname,"public")));
//Mount Routes

app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/user", user);
app.use("/api/v1/reviews", review);

app.use(errorHandler);


const server = app.listen(PORT, () => {
    console.log(`Server is running on ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold);
});

process.on("unhandledRejection", (err, promise) => {

    console.log(`Error: ${err.message}`.red.bold);

    server.close(() => process.exit(1));
})













// const mongoose = require("mongoose");

// const connectDB = async () => {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     });

//     console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline.bold);
// }

// module.exports = connectDB;



// const server = app.listen(PORT, () => {
//     console.log(`Server is running on ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
// });
// //Handle unhandled promise rejections;

// process.on("unhandledRejection", (err, promise) => {

//     console.log(`Error: ${err.message}`.red.bold);

//     //Close server and exit

//     server.close(() => process.exit(1));
// })


// const ErrorResponse = require("../utils/errorResponse");


// const errorHandler = (err, req, res, next) => {

//     console.log(err.stack.red);

   


//     let error = {...err};

//     if (err.name === "CastError") {

//         let message = `Bootcamp not found with ${err.value}`;
//         error = new ErrorResponse(message, 404);
//     }

//     if (err.code === 11000) {
//         let message = `Duplicate value is here. Please fill another!`;
//         error = new ErrorResponse(message, 400);
//     };

    
//     console.log(Object.values(err.errors).map(val => val.properties.message));

//     if (err.name === "ValidationError") {
//         let message = Object.values(err.errors).map((val) => val.properties.message);
//         error = new ErrorResponse(message, 400)
//     }

//     res.status(error.statusCode || 500).json({
//         success: false,
//         error: error.message
//     })

  
// };

// module.exports = errorHandler;















































//Server.js (old)
// const express = require('express');
// const dotenv = require('dotenv');
// const logger = require('.//middleware/logger');
// const bootcamps = require('./routes/bootcamps');
// const morgan = require("morgan");
// dotenv.config({path: "./config/config.env"});

// const app = express();


// if (process.env.NODE_ENV === "development") {
//     app.use(morgan('dev'));
// }

// app.use(logger);

// app.use("/api/v1/bootcamps", bootcamps);



// const PORT = process.env.PORT || 8000;

// app.listen(PORT, (req, res) => {
//     console.log(`Server is running on ${process.env.NODE_ENV} mode on port ${PORT}`);
// })


//routes (old);
// const express = require('express');

// const router = express.Router();

// const { getAllBootcamps, getSingleBootcamp, createNewBootcamp, updateBootcamp, deleteBootcamp} = require('../controllers/bootcamps');

// router.
//     route("/").
//     get(getAllBootcamps).
//     post(createNewBootcamp);

// router.
//     route("/:id")
//     .get(getSingleBootcamp)
//     .put(updateBootcamp)
//     .delete(deleteBootcamp);
// module.exports = router;





//middleware

// const logger = (req, res, next) => {

//     req.user = "Thong Dang";
//     next();
// };

// module.exports = logger;

//controllers



//controllers



//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access public

// exports.getAllBootcamps = (req, res, next) => {

//     res.status(200).json({success: true, msg: "Show all bootcamps!"});
// };

// //@desc GET SINGLE BOOTCAMP
// //@route GET /api/v1/bootcamps/:id
// //@access public

// exports.getSingleBootcamp = (req, res, next) => {
//     res.status(200).json({success: true, msg: `Show a bootcamp ${req.params.id}`, user: req.user});
// };

// //@desc Create a bootcamp
// //@route POST /api/v1/bootcamps
// //@access PRIVATE

// exports.createNewBootcamp = (req, res, next) => {
//     res.status(200).json({success: true, msg: "Create a new bootcamp!"})
// };

// //@desc Update a bootcamp
// //@route PUT /api/v1/bootcamps/:id
// //@access PRIVATE

// exports.updateBootcamp = (req, res, next) => {
//     res.status(200).json({success: true, msg: `Update a bootcamp ${req.params.id}`});
// };

// //@desc Delete a bootcamp
// //@route DELETE /api/v1/bootcamps/:id
// //@access PRIVATE

// exports.deleteBootcamp = (req, res, next) => {
//     res.status(200).json({success: true, msg: `Delete a bootcamp ${req.params.id}`});
// }




// const mongoose = require("mongoose");

// const BootcampSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, "Please add a name"],
//         unique: true,
//         trim: true,
//         maxlength: [50, "Name cannot be more than 50 characters"]
//     },
//     slug: String,
//     description: {
//         type: String,
//         required: [true, "Please add a description"],
//         maxlength: [500, "Description cannot be more than 500 characters"]
//     },
//     website: {
//         type: String,
//         match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, "Please use a valid URL http or https"]
//     },
//     phone: {
//         type: String,
//         maxlength: [20, "Phone cannot be more than 20 characters"]
//     },
//     email: {
//         type: String,
//         match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"Please use a valid email"]
//     },
//     address: {
//         type: String,
//         required: [true, "Please add an address"]
//     },
//     // location: {
//     //     type: {
//     //         type: String, // Don't do `{ location: { type: String } }`
//     //         enum: ['Point'], // 'location.type' must be 'Point'
//     //         required: true
//     //       },
//     //       coordinates: {
//     //         type: [Number],
//     //         required: true,
//     //         index: "2dsphere"
//     //       }
//     // },
//     formattedForm: {
//         type: String,
//     },
//     street: {
//         type: String
//     },
//     city: {
//         type: String
//     },
//     state: {
//         type: String
//     },
//     zipcode: {
//         type: String
//     },
//     country: {
//         type: String
//     },
//     careers: {
//         type: [String],
//         enum: [
//             "Web Development",
//             "Mobile Development",
//             "UI/UX",
//             "Data Science",
//             "Business",
//             "Other"
//         ],
//         required: [true, "Please add careers"]
//     },
//     averageRating: {
//         type: Number,
//         min: [1, "Min must be 1"],
//         max: [10, "Rating cannot be more than 10"]
//     },
//     averageCost: {
//         type: "Number"
//     },
//     photo: {
//         type: String,
//         default: "no-photo.jpg"
//     },
//     housing: {
//         type: Boolean,
//         default: false
//     },
//     jobAssistance: {
//         type: Boolean,
//         default: false
//     },
//     jobGuarantee: {
//         type: Boolean,
//         default: false
//     },
//     acceptGi: {
//         type: Boolean,
//         default: false
//     },
//     createAt: {
//         type: Date,
//         default: Date.now
//     }

// });

// module.exports = mongoose.model("Bootcamp", BootcampSchema);



// const mongoose = require("mongoose");
// const fs = require("fs");
// const colors = require("colors");
// const dotenv = require("dotenv")

// dotenv.config({path: "./config/config.env"});

// const Bootcamp = require("./models/bootcamp");

// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

// const bootcamp = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8"));

// const importData = async () => {

//     try {
        
//         await Bootcamp.create(bootcamp);

//         console.log("Data imported".green.inverse);
//         process.exit();
//     } catch (err) {
//         console.error(err);
//     }
// };

// const deleteData = async () => {

//     try {

//         await Bootcamp.deleteMany();

//         console.log("Data deleted...".red.inverse);

//         process.exit();

//     } catch (err) {
//         console.error(err);
//     }
// };

// if (process.argv[2] === "-i") {
//     importData();
// } else if (process.argv[2] === "-d") {
//     deleteData();
// }





