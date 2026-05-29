const express = require("express");
const router = express.Router();
const { createDoctor, listDoctors, updateSlots, getDoctorByUser, getDoctorDashboardStats, updateDoctorProfile } = require("../controllers/doctorController");
const { protect } = require("../middleware/authMiddleware");
const { permit } = require("../middleware/roleMiddleware");

router.get("/", listDoctors);
router.post("/", protect, permit("admin"), createDoctor);

router.get("/dashboard-stats", protect, permit("doctor"), getDoctorDashboardStats);
router.get("/me", protect, permit("doctor"), getDoctorByUser);
router.put("/me", protect, permit("doctor"), updateDoctorProfile);

module.exports = router;
