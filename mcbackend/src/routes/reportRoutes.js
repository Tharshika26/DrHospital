const express = require("express");
const router = express.Router();
const { uploadReport, getReport, getMyReports } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const { permit } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// patient uploads report
router.post("/upload", protect, permit("patient"), upload.single("file"), uploadReport);

// get all patient reports
router.get("/", protect, permit("patient"), getMyReports);

// get report
router.get("/:id", protect, permit("doctor", "patient", "admin"), getReport);

module.exports = router;
