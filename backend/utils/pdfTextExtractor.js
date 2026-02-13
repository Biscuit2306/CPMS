const fs = require("fs");

// pdf-parse export can be weird in different versions
const pdfParseImport = require("pdf-parse");

const extractTextFromPDF = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error("Resume file not found at: " + filePath);
  }

  const dataBuffer = fs.readFileSync(filePath);

  // ✅ Handle all possible exports
  const pdfParse =
    typeof pdfParseImport === "function"
      ? pdfParseImport
      : typeof pdfParseImport.default === "function"
      ? pdfParseImport.default
      : typeof pdfParseImport.pdfParse === "function"
      ? pdfParseImport.pdfParse
      : null;

  if (!pdfParse) {
    throw new Error("pdf-parse import failed: invalid export format");
  }

  const data = await pdfParse(dataBuffer);
  return data.text || "";
};

module.exports = { extractTextFromPDF };