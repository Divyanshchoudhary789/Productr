const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");


const User = require("../models/userModel.js");
const Otp = require("../models/otp.js");

const generateOtp = require("../utils/generateOtp.js");
const generateToken = require("../utils/generateToken.js");
const sendOtpEmail = require("../utils/sendOtpEmail.js");



const sendSignupOtp = async (req, res) => {
    try {
        const { name, email, mobileNumber } = req.body;

        if (!name || !email || !mobileNumber) {
            return res.status(400).json({ message: "All Fields are required!" });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (existingUser) {
            return res.status(400).json({ message: "Email or Mobile No is Already Used!" });
        }

        const existingOtp = await Otp.findOne({ email, type: "Signup" });

        if (existingOtp && Date.now() - existingOtp.createdAt.getTime() < 30000) {
            return res.status(429).json({ message: "Wait 30 seconds before requesting another OTP" });
        }

        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 12);

        await Otp.deleteMany({ email, type: "Signup" });

        await Otp.create({
            email,
            otp: hashedOtp,
            type: "Signup",
            payload: {
                name,
                mobileNumber
            },
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        await sendOtpEmail(email, otp);

        return res.status(200).json({ success: true, message: "OTP sent Successfully" });


    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}



const verifySignupOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpDoc = await Otp.findOne({ email, type: "Signup" });
        if (!otpDoc) {
            return res.status(400).json({ message: "OTP Expired!" });
        }

        const isValid = await bcrypt.compare(otp, otpDoc.otp);
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }


        const user = await User.create({
            name: otpDoc.payload.name,
            email,
            mobileNumber: otpDoc.payload.mobileNumber,
        });

        await Otp.deleteOne({ _id: otpDoc._id });

        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({ message: "Account Created Successfully", user });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}



const sendLoginOtp = async (req, res) => {
    try {

        const { identifier } = req.body;

        if (!identifier) {
            return res.status(400).json({ message: "Email or Mobile No is required!" });
        }


        let user;

        const isEmail = identifier.includes("@");

        if (isEmail) {
            user = await User.findOne({ email: identifier });
        } else {
            user = await User.findOne({ mobileNumber: identifier });
        }


        if (!user) {
            return res.status(404).json({ message: "User Not Found!" });
        }


        const existingOtp = await Otp.findOne({ email: user.email, type: "login" });

        if (existingOtp && Date.now() - existingOtp.createdAt.getTime() < 30000) {
            return res.status(429).json({ message: "Wait 30 seconds before requesting another OTP" });
        }

        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 12);

        await Otp.deleteMany({ email: user.email, type: "login" });

        await Otp.create({
            email: user.email,
            otp: hashedOtp,
            type: "login",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        await sendOtpEmail(user.email, otp);

        return res.status(200).json({ message: "OTP sent Successfully" });


    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}


const verifyLoginOtp = async (req, res) => {
    try {

        const { identifier, otp } = req.body;

        let user;

        const isEmail = identifier.includes("@");

        if (isEmail) {
            user = await User.findOne({ email: identifier });
        } else {
            user = await User.findOne({ mobileNumber: identifier });
        }

        if (!user) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        const otpDoc = await Otp.findOne({ email: user.email, type: "login" });

        if (!otpDoc) {
            return res.status(400).json({ message: "OTP Expired!" });
        }

        const isValid = await bcrypt.compare(otp, otpDoc.otp);

        if (!isValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        await Otp.deleteOne({ _id: otpDoc._id });

        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ message: "Login SuccessFull", user });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}


const logout = async (req, res) => {
    try {

        res.cookie("token", "", {
            expires: new Date(0),
            httpOnly: true,
        });


        return res.status(200).json({ message: "Logged Out Successfully" });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}


const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        return res.status(200).json({ message: "User Fetched Successfully", user });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
}





module.exports = { sendSignupOtp, verifySignupOtp, sendLoginOtp, verifyLoginOtp, logout, getCurrentUser };