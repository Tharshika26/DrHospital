const asyncHandler = require("express-async-handler");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

function generateSecurePassword() {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const special = "@$!%*?&";
    const all = lowercase + uppercase + digits + special;
    
    let password = "";
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    for (let i = 0; i < 8; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }
    
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

// POST /api/doctors - create doctor profile (admin)
const createDoctor = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, specialization, experienceYears } = req.body;
    
    if (!firstName || !lastName || !email) {
        res.status(400);
        throw new Error("Missing required fields");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error("Invalid email format");
    }
    
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
        res.status(400);
        throw new Error("User already exists with this email");
    }

    const generatedPassword = generateSecurePassword();
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(generatedPassword, salt);

    user = await User.create({ 
        name: `${firstName} ${lastName}`, 
        email: email.toLowerCase(), 
        password: hashed, 
        role: "doctor" 
    });

    const doctor = await Doctor.create({ 
        user: user._id, 
        specialization, 
        experienceYears, 
        phone 
    });

    // Send credentials via email
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 465,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });


    const mailHtml = '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 40px 0;">' +
        '<tr><td align="center">' +
        '<table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0; text-align: left;">' +
        '<tr><td align="center" style="background: linear-gradient(135deg, #0f172a, #0d9488); padding: 40px 20px; color: #ffffff;">' +
        '<div style="font-size: 28px; font-weight: bold; margin-bottom: 6px; letter-spacing: 1px;">Dr.HOSPITAL</div>' +
        '<div style="font-size: 14px; color: #ccfbf1; opacity: 0.9;">Doctor Account Registration</div>' +
        '</td></tr>' +
        '<tr><td style="padding: 40px 30px;">' +
        '<h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 20px; font-weight: 600;">Welcome, Dr. ' + firstName + ' ' + lastName + '</h2>' +
        '<p style="margin: 0 0 25px 0; color: #475569; font-size: 15px; line-height: 1.6;">Your professional doctor profile has been registered. Below are your login credentials:</p>' +
        '<table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #f1f5f9; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #0d9488;">' +
        '<tr><td style="font-size: 14px; color: #475569; font-weight: 600; width: 150px;">Username (Email):</td>' +
        '<td style="font-size: 14px; color: #1e293b; font-weight: 700; font-family: monospace;">' + email + '</td></tr>' +
        '<tr><td style="font-size: 14px; color: #475569; font-weight: 600;">Temporary Password:</td>' +
        '<td style="font-size: 14px; color: #1e293b; font-weight: 700; font-family: monospace;">' + generatedPassword + '</td></tr>' +
        '</table>' +
        '<div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px; margin-bottom: 25px;">' +
        '<p style="margin: 0; color: #b45309; font-size: 14px; font-weight: 500; line-height: 1.5;">' +
        '<strong>Security Notice:</strong> Log in via the frontend. Immediately change this temporary password using the <strong>"Forgot Password"</strong> option on the login screen.' +
        '</p></div>' +
        '<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">' +
        '<p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">If you have any questions, contact IT support.</p>' +
        '</td></tr>' +
        '<tr><td style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #f1f5f9;">' +
        '<p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; 2026 Hospital Management System. All rights reserved.</p>' +
        '</td></tr></table></td></tr></table>';

    const mailOptions = {
        from: '"Dr.HOSPITAL Support" <' + (process.env.SMTP_USER || "noreply@hms.com") + '>',
        to: email,
        subject: "Your Doctor Account Credentials - Dr.HOSPITAL",
        text: `Welcome, Dr. ${firstName} ${lastName}.\n\nYour professional doctor profile has been registered.\n\nUsername (Email): ${email}\nTemporary Password: ${generatedPassword}\n\nPlease change this password upon your first login.`,
        html: mailHtml
    };

    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
        console.log("\n[WARNING] SMTP is not configured in .env. Falling back to console simulation.");
        console.log(`[SIMULATED EMAIL] To: ${email.replace(/^(.)(.*)(@.*)$/, "$1***$3")} -> Doctor Credentials:\nUsername: ${email.replace(/^(.)(.*)(@.*)$/, "$1***$3")}\nPassword: ${generatedPassword}\n`);
    } else {
        try {
            await transporter.sendMail(mailOptions);
            console.log(`[Email] Doctor credentials successfully sent to ${email.replace(/^(.)(.*)(@.*)$/, "$1***$3")}`);
        } catch (error) {
            console.error("Email Error:", error);
            console.log(`[BACKUP CREDENTIALS] Email: ${email.replace(/^(.)(.*)(@.*)$/, "$1***$3")}, Password: ${generatedPassword}`);
        }
    }

    res.status(201).json(doctor);
});

// GET /api/doctors - list doctors (public)
const listDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find().populate("user", "name email isDisabled");
    res.json(doctors);
});

// PUT /api/doctors/:id/slots - update slots (doctor)
const updateSlots = asyncHandler(async (req, res) => {
    const doc = await Doctor.findById(req.params.id);
    if (!doc) {
        res.status(404);
        throw new Error("Doctor not found");
    }
    // check ownership
    if (req.user.role !== "admin" && String(doc.user) !== String(req.user._id)) {
        res.status(403);
        throw new Error("Not allowed");
    }
    doc.availableSlots = req.body.availableSlots || doc.availableSlots;
    await doc.save();
    res.json(doc);
});

const getDoctorByUser = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "name email");
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }
    res.json(doctor);
});

const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");

const getDoctorDashboardStats = asyncHandler(async (req, res) => {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
        res.status(404);
        throw new Error("Doctor profile not found");
    }

    const today = new Date().toISOString().split('T')[0];
    
    const totalAppointments = await Appointment.countDocuments({ doctor: doctorProfile._id });
    const todayAppointments = await Appointment.countDocuments({ 
        doctor: doctorProfile._id,
        date: today 
    });
    
    const uniquePatients = await Appointment.find({ doctor: doctorProfile._id }).distinct("patient");
    const totalPatients = uniquePatients.length;

    const upcomingAppointments = await Appointment.find({ 
        doctor: doctorProfile._id,
        date: { $gte: today },
        status: { $nin: ["completed", "Completed", "rejected", "Rejected"] }
    })
    .populate({
        path: "patient",
        populate: { path: "user", select: "name" }
    })
    .sort("date")
    .limit(10);

    res.json({
        totalAppointments,
        todayAppointments,
        totalPatients,
        pendingRequests: upcomingAppointments.map(req => ({
            id: req._id,
            patientName: req.patient?.user?.name || "Unknown",
            date: new Date(req.date).toLocaleDateString(),
            rawDate: req.date, // Added for frontend comparison
            time: req.timeSlot,
            status: req.status, // Added for frontend display
            reason: "Consultation"
        }))
    });
});

const updateDoctorProfile = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor profile not found");
    }

    const { firstName, lastName, email, phone, specialization, experienceYears, bio, password } = req.body;

    const user = await User.findById(req.user._id);
    if (user) {
        user.name = `${firstName} ${lastName}`;
        if (email && email.toLowerCase() !== user.email.toLowerCase()) {
            const emailExists = await User.findOne({ email: email.toLowerCase() });
            if (emailExists) {
                res.status(400);
                throw new Error("Email address is already in use by another account");
            }
            user.email = email.toLowerCase();
        }
        if (password) {
            const bcrypt = require("bcryptjs");
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
    }

    doctor.phone = phone !== undefined ? phone : doctor.phone;
    doctor.specialization = specialization !== undefined ? specialization : doctor.specialization;
    doctor.experienceYears = experienceYears !== undefined ? experienceYears : doctor.experienceYears;
    doctor.bio = bio !== undefined ? bio : doctor.bio;
    await doctor.save();

    res.json({
        user: { name: user.name, email: user.email },
        phone: doctor.phone,
        specialization: doctor.specialization,
        experienceYears: doctor.experienceYears,
        bio: doctor.bio
    });
});

module.exports = { 
    createDoctor, 
    listDoctors, 
    updateSlots, 
    getDoctorByUser, 
    getDoctorDashboardStats,
    updateDoctorProfile
};
