const express = require("express");
const userRouter = express.Router();

const { sendSignupOtp, verifySignupOtp, sendLoginOtp, verifyLoginOtp, logout, getCurrentUser } = require("../controllers/userController.js");

const otpLimiter = require("../middleware/rateLimiter.js");
const isAuthenticated = require("../middleware/authMiddleware.js");


userRouter.post("/signup/send-otp", otpLimiter, sendSignupOtp);
userRouter.post("/signup/verify-otp", verifySignupOtp);


userRouter.post("/login/send-otp", otpLimiter, sendLoginOtp);
userRouter.post("/login/verify-otp", verifyLoginOtp);


userRouter.post("/logout", logout);

userRouter.get("/user", isAuthenticated, getCurrentUser);


module.exports = userRouter;