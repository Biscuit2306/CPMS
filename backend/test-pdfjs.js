#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🧪 TESTING pdfjs-dist EXTRACTION\n");
console.log("=".repeat(60));

async function testPdfjsExtraction() {
  try {
    const pdfjs = require("pdfjs-dist/legacy/build/pdf");
    console.log("✅ pdfjs-dist loaded\n");
    
    const resumeDir = path.join(__dirname, "uploads", "resumes");
    const files = fs.readdirSync(resumeDir).filter(f => f.endsWith(".pdf"));
    
    for (let i = 0; i < Math.min(2, files.length); i++) {
      const filePath = path.join(resumeDir, files[i]);
      console.log(`📄 Testing: ${files[i]}`);
      
      const dataBuffer = fs.readFileSync(filePath);
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(dataBuffer) }).promise;
      console.log(`   Pages: ${pdf.numPages}`);
      
      let fullText = "";
      for (let pageNum = 1; pageNum <= Math.min(3, pdf.numPages); pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
        console.log(`   Page ${pageNum}: ${pageText.substring(0, 80)}...`);
      }
      
      console.log(`   Total text length: ${fullText.length} characters\n`);
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
  }
}

testPdfjsExtraction();
