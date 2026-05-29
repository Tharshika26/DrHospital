const express = require("express");
const router = express.Router();
const { 
    bookAppointment, 
    respondAppointment, 
    createCheckoutSession, 
    saveAppointmentByStaff, 
    getAllAppointments,
    updateAppointmentCondition,
    completeAppointment
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");
const { permit } = require("../middleware/roleMiddleware");

router.get("/", protect, permit("doctor", "admin", "patient"), getAllAppointments);
router.post("/", protect, permit("doctor", "admin", "patient"), saveAppointmentByStaff);
router.post("/book", protect, permit("patient"), bookAppointment);
router.post("/create-checkout-session", protect, createCheckoutSession);
router.put("/:id/respond", protect, permit("doctor", "admin"), respondAppointment);
router.put("/:id/condition", protect, permit("doctor"), updateAppointmentCondition);
router.put("/:id/complete", protect, permit("doctor"), completeAppointment);



module.exports = router;
