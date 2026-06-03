const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    mobileNumber: {
        type: String,
        required: true,
        unique: true
    },

    profileImage: {
        type: String,
        default: ""
    },

    otpAttempts: {
        type: Number,
        default: 0
    },

    otpBlockedUntil: {
        type: Date,
        default: null,
    },

    lastOtpSentAt: {
        type: Date,
        default: null
    },


}, { timestamps: true });


const User = mongoose.model("User", userSchema);


module.exports = User;