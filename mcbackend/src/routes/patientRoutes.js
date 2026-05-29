const express = require("express");
const router = express.Router();
const { createPatientProfile, getPatientByUser, getAllPatients, getDoctorPatients, updatePatientProfile, getPatientDashboardData, updateClinicalCondition } = require("../controllers/patientController");
const { protect } = require("../middleware/authMiddleware");
const { permit } = require("../middleware/roleMiddleware");

router.post("/profile", protect, permit("patient"), createPatientProfile);
router.get("/me", protect, permit("patient"), getPatientByUser);
router.get("/dashboard", protect, permit("patient"), getPatientDashboardData);
router.put("/me", protect, permit("patient"), updatePatientProfile);
router.get("/doctor-patients", protect, permit("doctor"), getDoctorPatients);
router.put("/:id/condition", protect, permit("doctor"), updateClinicalCondition);
router.get("/", protect, permit("admin", "doctor"), getAllPatients);

module.exports = router;
