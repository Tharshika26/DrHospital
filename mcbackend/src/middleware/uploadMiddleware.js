const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// store locally in uploads/ (ensure folder exists)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    // accept images and pdf
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type"), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

module.exports = upload;
