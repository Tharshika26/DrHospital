const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const { protect } = require("../middleware/authMiddleware");
const { permit } = require("../middleware/roleMiddleware");

router.post("/", protect, permit("admin"), async (req, res, next) => {
    try {
        const { name, title, description, price, durationMins, status, iconName } = req.body;
        const finalName = name || title || "Untitled";
        const s = await Service.create({ name: finalName, title: finalName, description, price, durationMins, status, iconName });
        res.status(201).json(s);
    } catch (error) {
        next(error);
    }
});

// list services
router.get("/", async (req, res) => {
    const services = await Service.find();
    res.json(services);
});

module.exports = router;
