const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const dns = require("dns");

dotenv.config();

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    logger: true,
    debug: true,
});

(async () => {
    try {
        await transporter.verify();
        console.log("SMTP READY");
    } catch (err) {
        console.error("SMTP VERIFY ERROR");
        console.error(err);
    }
})();

const sendOtpEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"Productr Auth" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Your Verification OTP - Productr",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Verification OTP</h2>
                    <p>Use the OTP below to verify your account:</p>

                    <div
                        style="
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 6px;
                            color: #031677;
                            margin: 20px 0;
                        "
                    >
                        ${otp}
                    </div>

                    <p>This OTP will expire in 5 minutes.</p>
                    <p>If you did not request this OTP, please ignore this email.</p>
                </div>
            `,
        };

        const result = await transporter.sendMail(mailOptions);

        console.log("Email Sent:", result.messageId);

        if (!result.accepted || result.accepted.length === 0) {
            throw new Error("Email not accepted by SMTP server");
        }

        return result;
    } catch (err) {
        console.error("Email Send Error:", err);
        throw err;
    }
};

module.exports = sendOtpEmail;