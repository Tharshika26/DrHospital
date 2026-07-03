const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Otp = require("../models/Otp");
const generateToken = require("../utils/generateToken");
const nodemailer = require("nodemailer");

// Configure transporter for emails
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Helper to generate JWT token and send in response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    res.status(statusCode).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token
    });
};

// @desc Register user
// @route POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
    const { name, email, password, role, age, gender, contact, address } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please provide name, email, password");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error("Invalid email format");
    }

    // Password validation: min 8 chars, 1 upper, 1 lower, 1 digit, 1 special
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        res.status(400);
        throw new Error("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role });

    if (user.role === 'patient') {
        const Patient = require('../models/Patient');
        await Patient.create({
            user: user._id,
            age: age || null,
            gender: gender || '',
            contact: contact || '',
            address: address || '',
            medicalHistory: []
        });
    }

    if (user) {
        sendTokenResponse(user, 201, res);
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// @desc Login
// @route POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Hardcoded Admin Credentials
    if (email === 'admin@gmail.com' && password === 'Admin123@') {
        let user = await User.findOne({ email: 'admin@gmail.com' });
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash('Admin123@', salt);
            user = await User.create({
                name: 'Administrator',
                email: 'admin@gmail.com',
                password: hashed,
                role: 'admin',
            });
        } else if (user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }
        if (user.isDisabled) {
            res.status(401);
            throw new Error("Admin account is disabled.");
        }
        return sendTokenResponse(user, 200, res);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        res.status(401);
        throw new Error("Invalid credentials");
    }
    const valid = await bcrypt.compare(password, user.password);
    if (user && valid) {
        if (user.isDisabled) {
            res.status(401);
            throw new Error("your account has been disabled");
        }
        sendTokenResponse(user, 200, res);
    } else {
        res.status(401);
        throw new Error("Invalid credentials");
    }
});

// @desc Send Email OTP
// @route POST /api/auth/send-email-otp
// @access Public
const sendEmailOtp = asyncHandler(async (req, res) => {
    const { email, name } = req.body;
    if (!email) {
        res.status(400);
        throw new Error("Please provide an email address");
    }

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove existing OTPs for this email to prevent spam
    await Otp.deleteMany({ email: email.toLowerCase() });

    await Otp.create({
        email: email.toLowerCase(),
        otpCode
    });

    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
        console.log("\n[WARNING] SMTP is not configured in .env. Falling back to console simulation.");
        console.log(`[SIMULATED EMAIL] To: ${email.replace(/^(.)(.*)(@.*)$/, "$1***$3")} (Name: ${name || 'Patient'}) -> Code: ${otpCode}\n`);
        return res.status(200).json({ message: "OTP sent successfully (Simulated)" });
    }
    try {
        await transporter.sendMail({
            from: `"Dr.HOSPITAL Verification" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your Registration Verification Code - Dr.HOSPITAL",
            text: `Hi ${name || 'Patient'},\n\nYour verification code is: ${otpCode}. This code will expire in 5 minutes.`,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Email Verification</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0; text-align: left;">
                                <tr>
                                    <td align="center" style="background: linear-gradient(135deg, #0f172a, #0d9488); padding: 45px 20px; color: #ffffff;">
                                        <div style="font-size: 28px; font-weight: bold; margin-bottom: 6px; letter-spacing: 1px;">Dr.HOSPITAL</div>
                                        <div style="font-size: 14px; color: #ccfbf1; opacity: 0.9;">Secure Access & Verification Portal</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 20px; font-weight: 600;">Verify Your Email Address</h2>
                                        <p style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px; font-weight: 600;">Hi ${name || 'Patient'},</p>
                                        <p style="margin: 0 0 25px 0; color: #475569; font-size: 15px; line-height: 1.6;">Thank you for registering with our Hospital Management System. To complete your account verification, please use the secure 6-digit Verification Code (OTP) below:</p>
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                                            <tr>
                                                <td align="center">
                                                    <div style="background-color: #f1f5f9; border: 2px dashed #0d9488; border-radius: 8px; padding: 18px 40px; display: inline-block;">
                                                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; color: #0d9488; letter-spacing: 6px; padding-left: 6px;">${otpCode}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin: 0 0 15px 0; color: #ef4444; font-size: 14px; font-weight: 500; text-align: center;">This verification code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
                                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                                        <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">If you did not initiate this registration request, you can safely ignore this email.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #f1f5f9;">
                                        <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">&copy; 2026 Hospital Management System. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            `,
        });
        console.log(`[Email] Successfully sent OTP to ${email.replace(/^(.)(.*)(@.*)$/, "$1***$3")}`);
        res.status(200).json({ message: "OTP sent successfully to your email" });
    } catch (error) {
        console.error("Email Error (SMTP failed, falling back to console simulation):", error);
        console.log(`\n[FALLBACK SIMULATION] SMTP failed. Code logged to console:`);
        console.log(`[SIMULATED EMAIL] To: ${email.replace(/^(.)(.*)(@.*)$/, "$1***$3")} (Name: ${name || 'Patient'}) -> Code: ${otpCode}\n`);
        return res.status(200).json({ message: "OTP sent successfully (Simulated fallback due to network/SMTP issue)" });
    }
});

// @desc Verify Email OTP
// @route POST /api/auth/verify-email-otp
// @access Public
const verifyEmailOtp = asyncHandler(async (req, res) => {
    const { email, code } = req.body;
    
    if (!email || !code) {
        res.status(400);
        throw new Error("Please provide email and OTP code");
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), otpCode: code });

    if (!otpRecord) {
        res.status(400);
        throw new Error("Invalid or expired OTP");
    }

    // Clean up used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "Email verified successfully" });
});

// @desc Forgot Password OTP Request
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error("Please provide an email address");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        res.status(404);
        throw new Error("No account found with this email address");
    }

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove existing OTPs for this email to prevent spam
    await Otp.deleteMany({ email: email.toLowerCase() });

    await Otp.create({
        email: email.toLowerCase(),
        otpCode
    });

    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
        console.log("\n[WARNING] SMTP is not configured in .env. Falling back to console simulation.");
        console.log(`[SIMULATED EMAIL] To: ${email.replace(/^(.)(.*)(@.*)$/, "$1***$3")} -> Forgot Password OTP Code: ${otpCode}\n`);
        return res.status(200).json({ message: "OTP sent successfully (Simulated)" });
    }
    try {
        const html = '<div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; font-family: sans-serif;">' +
            '<div style="background: linear-gradient(135deg, #0f172a, #0d9488); padding: 30px; text-align: center; color: #ffffff;">' +
            '<div style="font-size: 28px; font-weight: bold; letter-spacing: 1px;">Dr.HOSPITAL</div>' +
            '</div>' +
            '<div style="padding: 40px 30px; background: white;">' +
            '<h2 style="color: #1e293b; font-size: 18px; margin: 0 0 15px 0;">Hello ' + user.name + ',</h2>' +
            '<p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">We received a request to reset your password. Use the secure 6-digit verification code below to proceed:</p>' +
            '<div style="text-align: center; margin: 30px 0;">' +
            '<div style="background-color: #f1f5f9; border: 2px dashed #0d9488; border-radius: 8px; padding: 15px 30px; display: inline-block; font-size: 28px; font-weight: bold; color: #0d9488; letter-spacing: 5px;">' + otpCode + '</div>' +
            '</div>' +
            '<p style="color: #ef4444; font-size: 14px; text-align: center; font-weight: 500;">This code is valid for 5 minutes. Do not share it with anyone.</p>' +
            '</div>' +
            '</div>';

        await transporter.sendMail({
            from: '"Dr.HOSPITAL Support" <' + process.env.SMTP_USER + '>',
            to: email,
            subject: "Your Password Reset OTP - Dr.HOSPITAL",
            text: "Hi " + user.name + ",\n\nYour reset code is: " + otpCode,
            html: html,
        });
        console.log(`[Email] Successfully sent password reset OTP to ${email.replace(/^(.)(.*)(@.*)$/, "$1***$3")}`);
        res.status(200).json({ message: "OTP sent successfully to your email" });
    } catch (error) {
        console.error("Email Error (SMTP failed, falling back to console simulation):", error);
        console.log(`\n[FALLBACK SIMULATION] SMTP failed. Code logged to console:`);
        console.log(`[SIMULATED EMAIL] To: ${email.replace(/^(.)(.*)(@.*)$/, "$1***$3")} -> Forgot Password OTP Code: ${otpCode}\n`);
        return res.status(200).json({ message: "OTP sent successfully (Simulated fallback due to network/SMTP issue)" });
    }
});

// @desc Verify Reset OTP & Reset Password
// @route POST /api/auth/reset-password
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
        res.status(400);
        throw new Error("Please provide email, OTP code, and the new password");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        res.status(400);
        throw new Error("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), otpCode: code });
    if (!otpRecord) {
        res.status(400);
        throw new Error("Invalid or expired OTP");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Clean up OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "Password reset successfully" });
});

// @desc Verify Reset OTP (checks validity without deleting it)
// @route POST /api/auth/verify-reset-otp
// @access Public
const verifyResetOtp = asyncHandler(async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
        res.status(400);
        throw new Error("Please provide email and OTP code");
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), otpCode: code });
    if (!otpRecord) {
        res.status(400);
        throw new Error("Invalid or expired OTP");
    }

    res.status(200).json({ message: "OTP verified successfully" });
});

// @desc Logout user / clear session
// @route POST /api/auth/logout
// @access Private/Public
const logout = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
});

module.exports = { register, login, logout, sendEmailOtp, verifyEmailOtp, forgotPassword, resetPassword, verifyResetOtp };
