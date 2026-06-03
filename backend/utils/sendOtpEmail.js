const resend = require("../config/resend.js");

const sendOtpEmail = async (email, otp) => {
    try {
        const result = await resend.emails.send({
            from: "Productr <onboarding@resend.dev>",
            to: email,
            subject: "Your Verification OTP - Productr",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Verification OTP</h2>

                    <p>Use the OTP below to verify your account:</p>

                    <div style="
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 6px;
                        color: #031677;
                        margin: 20px 0;
                    ">
                        ${otp}
                    </div>

                    <p>This OTP will expire in 5 minutes.</p>
                    <p>If you did not request this OTP, ignore this email.</p>
                </div>
            `,
        });

        console.log("Email Sent:", result.id);

        return result;
    } catch (err) {
        console.error("Email Send Error:", err);
        throw err;
    }
};

module.exports = sendOtpEmail;