// Minimal email notifier using nodemailer - simple config.
// In production use proper templates, transactional email (SendGrid, SES).
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    // Example using gmail SMTP - set env vars as needed (not recommended for production)
    service: "gmail",
    auth: {
        user: process.env.NOTIFY_EMAIL_USER,
        pass: process.env.NOTIFY_EMAIL_PASS
    }
});

const sendNotification = async ({ to, subject, text }) => {
    if (!process.env.NOTIFY_EMAIL_USER) {
        console.log("Notification skipped: no email configured", { to, subject });
        return;
    }
    await transporter.sendMail({ from: process.env.NOTIFY_EMAIL_USER, to, subject, text });
};

module.exports = sendNotification;
