const asyncHandler = require("express-async-handler");
const Patient = require("../models/Patient");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const MedicalReport = require("../models/MedicalReport");
const Doctor = require("../models/Doctor");


// Create patient profile (on first login or register)
const createPatientProfile = asyncHandler(async (req, res) => {
    const { age, gender, contact } = req.body;
    const existing = await Patient.findOne({ user: req.user._id });
    if (existing) {
        res.status(400);
        throw new Error("Patient profile already exists");
    }
    const patient = await Patient.create({
        user: req.user._id,
        age,
        gender,
        contact,
        medicalHistory: []
    });
    res.status(201).json(patient);
});

const getPatientByUser = asyncHandler(async (req, res) => {
    let patient = await Patient.findOne({ user: req.user._id }).populate("user");
    if (!patient && req.user.role === "patient") {
        patient = await Patient.create({
            user: req.user._id,
            medicalHistory: []
        });
        patient = await Patient.findById(patient._id).populate("user");
    }
    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }
    res.json(patient);
});

const getAllPatients = asyncHandler(async (req, res) => {
    const patients = await Patient.find({}).populate("user", "name email isDisabled");
    res.json(patients);
});

const getPatientDashboardData = asyncHandler(async (req, res) => {
    let patient = await Patient.findOne({ user: req.user._id });
    if (!patient && req.user.role === "patient") {
        patient = await Patient.create({
            user: req.user._id,
            medicalHistory: []
        });
    }
    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    // 1. Get Appointments
    const appointments = await Appointment.find({ patient: patient._id })
        .populate({ path: "doctor", populate: { path: "user", select: "name specialization" } })
        .sort({ date: 1, timeSlot: 1 });

    const now = new Date();
    const upcoming = [];
    const past = [];

    appointments.forEach(appt => {
        const statusLower = (appt.status || "").toLowerCase();
        const isScheduled = statusLower === 'scheduled' || statusLower === 'confirmed' || statusLower === 'upcoming';

        let isPast = false;
        if (appt.date && appt.timeSlot) {
            try {
                const [year, month, day] = appt.date.toISOString().split('T')[0].split('-').map(Number);
                const [hours, minutes] = appt.timeSlot.split(':').map(Number);
                const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
                isPast = appointmentDateTime < now;
            } catch (e) {
                isPast = false;
            }
        }

        if (isPast || statusLower === 'completed' || statusLower === 'rejected') {
            past.push(appt);
        } else if (isScheduled) {
            upcoming.push(appt);
        }
    });

    // 2. Get Reports count
    const reportCount = await MedicalReport.countDocuments({ patient: patient._id });

    // 3. Get latest reports (history of up to 5)
    const allReports = await MedicalReport.find({ patient: patient._id })
        .sort({ uploadedAt: -1 })
        .limit(5)
        .populate("analysis");

    res.json({
        stats: {
            upcomingCount: upcoming.length,
            pastCount: past.length,
            reportCount
        },
        upcomingAppointments: upcoming.slice(0, 5), // return top 5
        allReports
    });
});

const getDoctorPatients = asyncHandler(async (req, res) => {
    // Find doctor profile for current user
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
        res.status(404);
        throw new Error("Doctor profile not found");
    }

    // Get unique patient IDs from appointments
    const appointmentPatients = await Appointment.find({ doctor: doctorProfile._id }).distinct("patient");

    // Fetch patient details
    const patients = await Patient.find({ _id: { $in: appointmentPatients } }).populate("user", "name email");

    res.json(patients);
});

// Update patient profile (me)
const updatePatientProfile = asyncHandler(async (req, res) => {
    let patient = await Patient.findOne({ user: req.user._id });
    if (!patient && req.user.role === "patient") {
        patient = await Patient.create({
            user: req.user._id,
            medicalHistory: []
        });
    }
    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    const { firstName, lastName, email, contact, address, age, gender, password } = req.body;

    // Update User model (name and email)
    const user = await User.findById(req.user._id);
    if (user) {
        user.name = `${firstName} ${lastName}`.trim() || user.name;
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

    // Update Patient model
    patient.contact = contact !== undefined ? contact : patient.contact;
    patient.address = address !== undefined ? address : patient.address;
    patient.age = age !== undefined ? age : patient.age;
    patient.gender = gender !== undefined ? gender : patient.gender;

    const updatedPatient = await patient.save();

    // Return populated
    const finalPatient = await Patient.findById(updatedPatient._id).populate("user");
    res.json(finalPatient);
});

const updateClinicalCondition = asyncHandler(async (req, res) => {
    const { clinicalCondition } = req.body;
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    patient.clinicalCondition = clinicalCondition;
    await patient.save();

    res.json(patient);
});

module.exports = {
    createPatientProfile,
    getPatientByUser,
    getAllPatients,
    getDoctorPatients,
    updatePatientProfile,
    getPatientDashboardData,
    updateClinicalCondition
};
