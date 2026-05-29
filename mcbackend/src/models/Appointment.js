const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" }, // Optional link to profile
    patientName: { type: String },
    patientPhone: { type: String },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    date: { type: Date, required: true },
    timeSlot: { type: String }, // e.g. "10:00-10:30"
    status: { type: String, enum: ["pending", "confirmed", "rejected", "completed", "Scheduled"], default: "pending" },
    paymentMethod: { type: String }, // e.g. "Cash", "Credit Card", "Visa", etc.
    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
    patientAge: { type: Number },
    hospitalFee: { type: Number, default: 500 },
    doctorFee: { type: Number, default: 1000 },
    totalAmount: { type: Number, default: 1500 },
    clinicalCondition: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Appointment", appointmentSchema);

