
const mongoose = require("mongoose");
let Bootcamp = require("./bootcamp");
const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true,"Please add a title"]
    },
    description: {
        type: String,
        required: [true,"Please add a description"]
    },
    weeks: {
        type: String,
        required: [true,"Please add a number of weeks"]
    },
    tuition: {
        type: Number,
        required: [true,"Please add a tuition cost"]
    },
    minimumSkill: {
        type: String,
        required: [true,"Please add a minimum skill"],
        enum: ["beginner","intermediate","advanced"]
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: "Bootcamp",
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
}

);

// CourseSchema.pre("remove", async function (next) {
//     await BootcampInfo.deleteMany({courseID: this._id});
//     next();
// });

CourseSchema.statics.getAverageCost = async function (bootcampId) {

    let obj = await this.aggregate([
        {
            $match: {bootcamp: bootcampId}
        },
        {
            $group: {
                _id: "$bootcamp",
                averageCost: {$avg: "$tuition"}
            }
        }
    ]);

    try {
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        })
         
    } catch (err) {
        console.error(err);
    }



};

CourseSchema.post("save", function () {
    this.constructor.getAverageCost(this.bootcamp);
});

CourseSchema.pre("remove", function () {
    this.constructor.getAverageCost(this.bootcamp);
});



CourseSchema.virtual("bootcampInfo", {
    ref: "Bootcamp",
    localField: "_id",
    foreignField: "courseID",
    justOne: false
});



module.exports = mongoose.model("Course", CourseSchema);

















































































// CourseSchema.statics.getAverageCost = async function (bootcampId) {

//     let obj = await this.aggregate([
//         {
//             $match: {bootcamp: bootcampId}
//         },
//         {
//             $group: {
//                 _id: "$bootcamp",
//                 averageCost: {$avg: "$tuition"}
//             }
//         }
//     ]);

//     try {

//         await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
//             averageCost: Math.ceil(obj[0].averageCost / 10) * 10
//         });

//     } catch (err) {
//         console.error(err);
//     }
// };

// CourseSchema.post("save", function () {
//     this.constructor.getAverageCost(this.bootcamp);
// });

// CourseSchema.pre("remove", function () {
//     this.constructor.getAverageCost(this.bootcamp);
// });
