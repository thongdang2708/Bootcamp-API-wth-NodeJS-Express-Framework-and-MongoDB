
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        match: [/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/, "Please fill a valid email"],
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ["user", "publisher"],
        default: "user"
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});


UserSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        next();
    }

    let salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_DAY
    })
};

UserSchema.methods.matchPassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
};

UserSchema.methods.getResetToken = function () {

    let resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex"); 

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}




module.exports = mongoose.model("User", UserSchema);


















