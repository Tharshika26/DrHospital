const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: String,
    description: String,
    price: Number,
    durationMins: Number,
    status: { type: String, default: "Active" },
    iconName: { type: String, default: "Heart" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Service", serviceSchema);
