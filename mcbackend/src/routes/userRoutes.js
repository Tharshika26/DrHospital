const express = require("express");
const router = express.Router();
const { getProfile, toggleDisable, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { permit } = require("../middleware/roleMiddleware");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/:id/toggle-disable", protect, permit("admin"), toggleDisable);

module.exports = router;
