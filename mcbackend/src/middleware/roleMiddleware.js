const asyncHandler = require("express-async-handler");

const permit = (...allowedRoles) => {
    return asyncHandler((req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401);
            throw new Error("Not authenticated");
        }
        if (!allowedRoles.includes(user.role)) {
            res.status(403);
            throw new Error("Forbidden: insufficient role");
        }
        next();
    });
};

module.exports = { permit };
