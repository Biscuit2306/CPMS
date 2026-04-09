#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 TESTING PDF EXTRACTION WITH ACTUAL FILES\n");
console.log("=".repeat(60));

async function testExtraction() {
  const pdfParseModule = require("pdf-parse");
  const PDFParse = pdfParseModule.PDFParse;
  
  const resumeDir = path.join(__dirname, "uploads", "resumes");
  const files = fs.readdirSync(resumeDir).filter(f => f.endsWith(".pdf"));
  
  console.log(`Found ${files.length} PDF files\n`);
  
  for (let i = 0; i < Math.min(2, files.length); i++) {
    const filePath = path.join(resumeDir, files[i]);
    console.log(`📄 Testing: ${files[i]}`);
    
    try {
      const dataBuffer = fs.readFileSync(filePath);
      console.log(`   File size: ${dataBuffer.length} bytes`);
      
      // Test 1: Try new PDFParse(dataBuffer) syntax
      console.log("   Method 1: new PDFParse(dataBuffer)");
      try {
        const data = await new PDFParse(dataBuffer);
        console.log(`     ✅ Success! Text length: ${(data.text || "").length}`);
        console.log(`     Preview: "${(data.text || "").substring(0, 100)}"`);
      } catch (err) {
        console.log(`     ❌ Failed: ${err.message}`);
      }
      
      // Test 2: Try PDFParse(dataBuffer) without new
      console.log("   Method 2: PDFParse(dataBuffer) without new");
      try {
        const data = await PDFParse(dataBuffer);
        console.log(`     ✅ Success! Text length: ${(data.text || "").length}`);
        console.log(`     Preview: "${(data.text || "").substring(0, 100)}"`);
      } catch (err) {
        console.log(`     ❌ Failed: ${err.message}`);
      }
      
      // Test 3: Try importing pdf-parse differently
      console.log("   Method 3: require('pdf-parse') as function");
      try {
        const pdfParse = require("pdf-parse");
        const data = await pdfParse(dataBuffer);
        console.log(`     ✅ Success! Text length: ${(data.text || "").length}`);
        console.log(`     Preview: "${(data.text || "").substring(0, 100)}"`);
      } catch (err) {
        console.log(`     ❌ Failed: ${err.message}`);
      }
      
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
    
    console.log();
  }
}

testExtraction().catch(console.error);
