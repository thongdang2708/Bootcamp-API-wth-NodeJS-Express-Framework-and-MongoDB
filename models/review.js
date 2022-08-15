
const mongoose = require("mongoose");
const bootcamp = require("./bootcamp");

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Please add a title for review"],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, "Please add a text for review"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, "Please add rating between 1 and 10"]
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
});

ReviewSchema.index({ bootcamp: 1, user: 1}, {unique: true});

ReviewSchema.statics.getAverageRating = async function (bootcampId) {

    let obj = await this.aggregate([
        {
            $match: {bootcamp: bootcampId}
        },
        {
            $group: {
                _id: "$bootcamp",
                averageRating: {$avg: "$rating"}
            }
        }
    ]);

    try {

        await bootcamp.findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating
        })

    } catch (err) {
        console.error(err);
    }
};


ReviewSchema.post("save", function () {
    this.constructor.getAverageRating(this.bootcamp);
}); 

ReviewSchema.pre("remove", function () {
    this.constructor.getAverageRating(this.bootcamp);
})

module.exports = mongoose.model("Review", ReviewSchema);