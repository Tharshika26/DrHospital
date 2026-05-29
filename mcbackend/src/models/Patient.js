const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    age: Number,
    gender: String,
    contact: String,
    address: String,
    clinicalCondition: { type: String, default: "" },
    medicalHistory: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Patient", patientSchema);
