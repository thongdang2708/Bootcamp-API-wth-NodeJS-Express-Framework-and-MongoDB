
const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");
const Course = require("../models/course");


const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
        unique: true,
        trim: true,
        maxlength: [50, "Name cannot be more than 50 characters"],
    },
    slug: String,
    description: {
        type: String,
        required: [true, "Please add a description"],
        maxlength: [500, "Description cannot be more than 500 characters"]
    },
    website: {
        type: String,
        match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,"Please use a valid URL http or https"]
    },
    phone: {
        type: String,
        maxlength: [20, "Phone number cannot be more than 20 characters"]
    },
    email: {
        type: String,
        match: [/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/, "Please use a valid email"],
    },
    // location: {
    //     type: {
    //         type: String, // Don't do `{ location: { type: String } }`
    //         enum: ['Point'], // 'location.type' must be 'Point'
    //         required: true
    //       },
    //       coordinates: {
    //         type: [Number],
    //         required: true,
    //         index: "2dsphere"
    //       }
    // }
    location: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
          },
          coordinates: {
            type: [Number],
            index: "2dsphere"
        },
        formattedAddress: {
            type: String
        },
        street: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        zipcode: {
            type: String
        },
        country: {
            type: String
        }
}
    ,
    address: {
        type: String,
        required: [true, "Please add an address"]
    },
    careers: {
        type: [String],
        enum: [
            "Web Development",
            "Mobile Development",
            "UI/UX",
            "Data Science",
            "Business",
            "Other"
        ],
        required: [true, "Please add careers"]
    },
    averageRating: {
        type: Number,
        min: [1, "Min number must be 1"],
        max: [10, "Max number cannot be more than 1o0"]
    },
    averageCost: {
        type: Number
    },
    photo: {
        type: String,
        default: "no-photo.jpg"
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
   

}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

// Create a slug for name
BootcampSchema.pre("save", function (next) {

    this.slug = slugify(this.name, { lower: true});

    next();
});


BootcampSchema.pre("save", async function (next) {

    let loc = await geocoder.geocode(this.address);

    this.location = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }

    this.address = undefined;

    next();
});

BootcampSchema.pre("remove", async function (next) {
    await Course.deleteMany({ bootcamp: this._id});
    next();
});

BootcampSchema.virtual("course", {
    ref: "Course",
    localField: "_id",
    foreignField: "bootcamp",
    justOne: false
});




module.exports = mongoose.model("Bootcamp",BootcampSchema);













































// BootcampSchema.pre("save", function (next) {

//     this.slug = slugify(this.name, {lower: true});

//     next();
// });

// BootcampSchema.pre("save", async function (next) {

//     let loc = await geocoder.geocode(this.address);
    
//     this.location = {
//         type: "Point",
//         coordinates: [loc[0].longitude, loc[0].latitude],
//         formattedAddress: loc[0].formattedAddress,
//         street: loc[0].streetName,
//         city: loc[0].city,
//         state: loc[0].stateCode,
//         zipcode: loc[0].zipcode,
//         country: loc[0].countryCode
//     };

//     this.address = undefined;

//     next();
    
// })
