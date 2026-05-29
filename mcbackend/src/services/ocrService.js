const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

// Determine file type and extract text
const extractTextFromFile = async (filePath, mimetype) => {
    if (mimetype === "application/pdf" || filePath.toLowerCase().endsWith(".pdf")) {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } else {
        // image -> use tesseract
        const { data } = await Tesseract.recognize(filePath, "eng", { logger: m => { } });
        return data.text;
    }
};

module.exports = { extractTextFromFile };
