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

// PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isDisabled: updatedUser.isDisabled,
    });
});

module.exports = { getProfile, toggleDisable, updateProfile };
