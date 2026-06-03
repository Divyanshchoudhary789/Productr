const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,       
        pass: process.env.GMAIL_APP_PASS,  
    },
});

const sendOtpEmail = async (email, otp) => {
    try {

        const mailOptions = {
            from: `"Productr Auth" <${process.env.GMAIL_USER}>`, 
            to: email,                                         
            subject: "Your Verification OTP - Productr",
            html: `
                <div style="font-family:sans-serif; padding:20px;">
                    <h2>Verification OTP:</h2>
                    <p>Use the OTP below to Continue:</p>
                    <h1 style="letter-spacing:5px; color:#031677;">${otp}</h1>
                    <p>OTP expires in 5 minutes.</p>
                </div>
            `,
        };

    
        const result = await transporter.sendMail(mailOptions);

        
        if (!result.accepted || result.accepted.length === 0) {
            throw new Error("Unable to send OTP via Nodemailer");
        }

    } catch (err) {
        console.log("Email send error:", err);
        throw err;
    }
};

module.exports = sendOtpEmail;