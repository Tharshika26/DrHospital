const asyncHandler = require("express-async-handler");
const MedicalReport = require("../models/MedicalReport");
const Patient = require("../models/Patient");
const AnalysisResult = require("../models/AnalysisResult");
const { extractTextFromFile } = require("../services/ocrService");
const { analyzeMedicalText } = require("../services/aiService");
const path = require("path");
const fs = require("fs");

// POST /api/reports/upload
const uploadReport = asyncHandler(async (req, res) => {
    // file processed by multer middleware (upload.single('file'))
    const file = req.file;
    if (!file) {
        res.status(400);
        throw new Error("No file uploaded");
    }
    let patient = await Patient.findOne({ user: req.user._id });
    if (!patient && req.user.role === "patient") {
        patient = await Patient.create({
            user: req.user._id,
            medicalHistory: []
        });
    }
    if (!patient) {
        res.status(400);
        throw new Error("Patient profile required");
    }

    // Save basic file info
    const newReport = await MedicalReport.create({
        patient: patient._id,
        filename: file.filename,
        originalname: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype
    });

    // Extract text (OCR / PDF)
    const filePath = path.resolve(file.path);
    const extractedText = await extractTextFromFile(filePath, file.mimetype);

    newReport.extractedText = extractedText;
    await newReport.save();

    // Call AI analyzer
    const aiResult = await analyzeMedicalText(extractedText);

    const analysis = await AnalysisResult.create({
        report: newReport._id,
        extractedValues: aiResult.extractedValues || {},
        abnormalValues: aiResult.abnormal || {},
        status: aiResult.status || "Unknown",
        summary: aiResult.summary || "",
        simplifiedExplanation: aiResult.simplifiedExplanation || "No explanation provided.",
        recommendations: aiResult.recommendations || []
    });

    // Link analysis to report
    newReport.analysis = analysis._id;
    await newReport.save();

    res.status(201).json({ report: newReport, analysis });
});

// GET /api/reports (fetch patient's reports)
const getMyReports = asyncHandler(async (req, res) => {
    let patient = await Patient.findOne({ user: req.user._id });
    if (!patient && req.user.role === "patient") {
        patient = await Patient.create({
            user: req.user._id,
            medicalHistory: []
        });
    }
    if (!patient) {
        res.status(400);
        throw new Error("Patient profile required");
    }

    const reports = await MedicalReport.find({ patient: patient._id })
        .populate("analysis")
        .sort({ uploadedAt: -1 });
    
    res.json(reports);
});

// GET /api/reports/:id
const getReport = asyncHandler(async (req, res) => {
    const report = await MedicalReport.findById(req.params.id)
        .populate("patient")
        .populate({ path: "analysis" });
    if (!report) {
        res.status(404);
        throw new Error("Report not found");
    }
    res.json(report);
});

module.exports = { uploadReport, getReport, getMyReports };
