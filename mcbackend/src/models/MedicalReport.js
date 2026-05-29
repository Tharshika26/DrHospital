const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    filename: String,
    originalname: String,
    fileUrl: String,
    fileType: String,
    extractedText: String,
    analysis: { type: mongoose.Schema.Types.ObjectId, ref: "AnalysisResult" },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MedicalReport", medicalReportSchema);
