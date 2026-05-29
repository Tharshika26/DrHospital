const asyncHandler = require("express-async-handler");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

const getDashboardStats = asyncHandler(async (req, res) => {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.countDocuments({
        date: { $gte: today, $lt: tomorrow }
    });

    const totalAppointments = await Appointment.countDocuments();

    const upcoming = await Appointment.find({})
        .populate({ path: "patient", populate: { path: "user", select: "name" } })
        .populate({ path: "doctor", populate: { path: "user", select: "name" } })
        .sort("-createdAt")
        .limit(10);

    res.json({
        totalPatients,
        totalDoctors,
        todayAppointments,
        totalAppointments,
        upcoming: upcoming.map(u => ({
            id: u._id,
            patientName: u.patient?.user?.name || "Unknown",
            doctorName: u.doctor?.user?.name || "Unknown",
            date: new Date(u.date).toLocaleDateString(),
            time: u.timeSlot,
            status: u.status
        }))
    });
});

module.exports = { getDashboardStats };
