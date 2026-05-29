const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
    report: { type: mongoose.Schema.Types.ObjectId, ref: "MedicalReport" },
    extractedValues: { type: Object, default: {} },
    abnormalValues: { type: Object, default: {} },
    status: String,
    summary: String,
    simplifiedExplanation: String,
    recommendations: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AnalysisResult", analysisSchema);
