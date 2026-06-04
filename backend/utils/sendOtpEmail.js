const nodemailer = require("nodemailer");

let transporter;

const getEnv = (...keys) => {
    for (const key of keys) {
        if (process.env[key]) {
            return process.env[key];
        }
    }

    return undefined;
};

const getTransporter = () => {
    if (transporter) {
        return transporter;
    }

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const isGmailSmtp = host === "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : port === 465;
    const user = isGmailSmtp ? getEnv("SMTP_USER", "GMAIL_USER") : process.env.SMTP_USER;
    const pass = isGmailSmtp ? getEnv("SMTP_PASS", "GMAIL_APP_PASS") : process.env.SMTP_PASS;

    if (!user || !pass) {
        throw new Error(
            isGmailSmtp
                ? "Missing required email environment variables: SMTP_USER/SMTP_PASS or GMAIL_USER/GMAIL_APP_PASS"
                : "Missing required email environment variables: SMTP_USER and SMTP_PASS"
        );
    }

    transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        family: 4,
        auth: {
            user,
            pass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        dnsTimeout: 10000,
        requireTLS: !secure,
        tls: {
            servername: host,
        },
    });

    return transporter;
};

const isSmtpConnectionError = (err) => {
    return ["ETIMEDOUT", "ENETUNREACH", "ECONNREFUSED", "ECONNRESET"].includes(err?.code)
        && err?.command === "CONN";
};

const sendOtpEmail = async (email, otp) => {
    try {
        const host = process.env.SMTP_HOST || "smtp.gmail.com";
        const emailUser = host === "smtp.gmail.com" ? getEnv("MAIL_FROM", "GMAIL_USER") : process.env.MAIL_FROM;

        if (!emailUser) {
            throw new Error(
                host === "smtp.gmail.com"
                    ? "Missing required email environment variable: MAIL_FROM or GMAIL_USER"
                    : "Missing required email environment variable: MAIL_FROM"
            );
        }

        const mailOptions = {
            from: `"Productr" <${emailUser}>`,
            to: email,
            replyTo: process.env.MAIL_REPLY_TO || emailUser,
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
        };

        const result = await getTransporter().sendMail(mailOptions);
        console.log("Email Sent:", result.messageId);

        return result;
    } catch (err) {
        if (isSmtpConnectionError(err)) {
            console.error(
                `Email Send Error: SMTP connection failed (${err.code}) at ${err.address || "unknown address"}:${err.port || "unknown port"}. Check Render env SMTP_HOST/SMTP_PORT/SMTP_SECURE and SMTP credentials.`
            );
        } else {
            console.error("Email Send Error:", err);
        }

        const emailError = new Error("Unable to send OTP email right now. Please try again later.");
        emailError.cause = err;
        emailError.statusCode = 503;
        throw emailError;
    }
};

module.exports = sendOtpEmail;
