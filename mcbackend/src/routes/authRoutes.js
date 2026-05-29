const express = require("express");
const router = express.Router();
const { register, login, logout, sendEmailOtp, verifyEmailOtp, forgotPassword, resetPassword, verifyResetOtp } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-reset-otp", verifyResetOtp);

module.exports = router;
