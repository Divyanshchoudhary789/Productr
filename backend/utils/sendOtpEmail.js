const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const dns = require("dns");

dotenv.config();

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

transporter.verify((err, success) => {
    if (err) {
        console.log("SMTP VERIFY ERROR:", err);
    } else {
        console.log("SMTP READY");
    }
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
                    <p>Use the OTP below to continue:</p>
                    <h1 style="letter-spacing:5px; color:#031677;">
                        ${otp}
                    </h1>
                    <p>OTP expires in 5 minutes.</p>
                </div>
            `,
        };

        const result = await transporter.sendMail(mailOptions);

        console.log("Email sent:", result.messageId);

        if (!result.accepted || result.accepted.length === 0) {
            throw new Error("Unable to send OTP via Nodemailer");
        }

        return result;
    } catch (err) {
        console.error("Email send error:", err);
        throw err;
    }
};

module.exports = sendOtpEmail;