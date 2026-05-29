const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { permit } = require("../middleware/roleMiddleware");

router.get("/dashboard", protect, permit("admin"), getDashboardStats);

module.exports = router;
