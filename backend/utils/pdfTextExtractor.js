const fs = require("fs");

// pdf-parse exports PDFParse as a named export (capital P)
const pdfParseModule = require("pdf-parse");
let pdfjs;
try {
  pdfjs = require("pdfjs-dist/legacy/build/pdf");
} catch (e) {
  pdfjs = null;
}

const extractTextFromPDF = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error("Resume file not found at: " + filePath);
  }

  const dataBuffer = fs.readFileSync(filePath);

  // ✅ Try pdf-parse first
  try {
    const pdfParse =
      typeof pdfParseModule === "function"
        ? pdfParseModule
        : typeof pdfParseModule.default === "function"
        ? pdfParseModule.default
        : typeof pdfParseModule.PDFParse === "function"
        ? pdfParseModule.PDFParse
        : null;

    if (pdfParse) {
      const data = await new pdfParse(dataBuffer);
      if (data.text && data.text.trim().length > 0) {
        return data.text;
      }
    }
  } catch (err) {
    console.warn("⚠️  pdf-parse failed:", err.message);
  }

  // Fallback to pdfjs-dist if pdf-parse fails or returns empty
  if (pdfjs) {
    try {
      console.log("📘 Using pdfjs-dist as fallback...");
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(dataBuffer) }).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map((item) => item.str).join(" ") + "\n";
      }

      if (text.trim().length > 0) {
        return text;
      }
    } catch (err) {
      console.warn("⚠️  pdfjs-dist fallback failed:", err.message);
    }
  }

  throw new Error("Could not extract text from PDF using either pdf-parse or pdfjs-dist");
};

module.exports = { extractTextFromPDF };