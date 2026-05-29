const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    specialization: { type: String },
    experienceYears: { type: Number },
    bio: { type: String },
    phone: { type: String },
    // availableSlots: array of { date, from, to } or reusable schedules
    availableSlots: [
        {
            day: String, // Eg: "Monday"
            from: String, // "09:00"
            to: String // "14:00"
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Doctor", doctorSchema);
