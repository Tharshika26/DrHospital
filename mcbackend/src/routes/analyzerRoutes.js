const express = require("express");
const router = express.Router();
const { getAnalysis } = require("../controllers/analyzerController");
const { protect } = require("../middleware/authMiddleware");
const { permit } = require("../middleware/roleMiddleware");

// fetch analysis
router.get("/:id", protect, permit("doctor", "patient", "admin"), getAnalysis);

module.exports = router;
