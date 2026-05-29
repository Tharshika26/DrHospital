const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    res.json(user);
});

// PUT /api/users/:id/toggle-disable
const toggleDisable = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    user.isDisabled = !user.isDisabled;
    await user.save();

    res.json({ message: `User ${user.isDisabled ? 'disabled' : 'enabled'} successfully`, isDisabled: user.isDisabled });
});

module.exports = { getProfile, toggleDisable };
