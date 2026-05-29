const asyncHandler = require("express-async-handler");
const AnalysisResult = require("../models/AnalysisResult");

// GET /api/analyze/:id  (fetch analysis)
const getAnalysis = asyncHandler(async (req, res) => {
    const analysis = await AnalysisResult.findById(req.params.id);
    if (!analysis) {
        res.status(404);
        throw new Error("Analysis not found");
    }
    res.json(analysis);
});

module.exports = { getAnalysis };
