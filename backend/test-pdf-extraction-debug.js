#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 PDF EXTRACTION DEBUG TEST\n");
console.log("=".repeat(60));

// Test 1: Try importing pdf-parse directly
console.log("\n1️⃣  Testing pdf-parse directly:");
try {
  const pdfParseModule = require("pdf-parse");
  console.log("   📦 Module loaded");
  console.log("   Keys:", Object.keys(pdfParseModule));
  console.log("   typeof module:", typeof pdfParseModule);
  console.log("   typeof module.default:", typeof pdfParseModule.default);
  console.log("   typeof module.PDFParse:", typeof pdfParseModule.PDFParse);
  
  // Check what the actual export is
  if (typeof pdfParseModule === "function") {
    console.log("   ✅ Module itself is a function (default export)");
  } else if (typeof pdfParseModule.default === "function") {
    console.log("   ✅ module.default is a function");
  } else if (typeof pdfParseModule.PDFParse === "function") {
    console.log("   ✅ module.PDFParse is a function (named export)");
  }
} catch (err) {
  console.error("   ❌ Error:", err.message);
}

// Test 2: Test the pdfTextExtractor
console.log("\n2️⃣  Testing pdfTextExtractor module:");
try {
  const { extractTextFromPDF } = require("./utils/pdfTextExtractor");
  console.log("   ✅ Module loaded");
  console.log("   Function type:", typeof extractTextFromPDF);
} catch (err) {
  console.error("   ❌ Error loading:", err.message);
  console.error("   Full error:", err);
}

// Test 3: Check if a test PDF exists
console.log("\n3️⃣  Checking for test PDFs:");
const uploadDir = path.join(__dirname, "uploads", "resumes");
if (fs.existsSync(uploadDir)) {
  const files = fs.readdirSync(uploadDir);
  if (files.length > 0) {
    console.log(`   Found ${files.length} file(s):`);
    files.forEach((f) => {
      const filePath = path.join(uploadDir, f);
      const stats = fs.statSync(filePath);
      console.log(`     - ${f} (${stats.size} bytes)`);
    });
  } else {
    console.log("   ⚠️  No resumes uploaded yet");
  }
} else {
  console.log(`   ⚠️  Directory doesn't exist: ${uploadDir}`);
}

// Test 4: Create a simple text-based "PDF" to test extraction
console.log("\n4️⃣  Creating test PDF file:");
try {
  const testDir = path.join(__dirname, "uploads", "resumes");
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Create simple valid PDF structure
  const simplePDF = Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Hello World Test Resume) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000267 00000 n 
0000000362 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
443
%%EOF`);
  
  const testPdfPath = path.join(testDir, "test-resume.pdf");
  fs.writeFileSync(testPdfPath, simplePDF);
  console.log(`   ✅ Created test PDF: ${testPdfPath}`);
  console.log(`   File size: ${simplePDF.length} bytes`);
  
  // Test 5: Try extracting from the test PDF
  console.log("\n5️⃣  Attempting extraction from test PDF:");
  const { extractTextFromPDF } = require("./utils/pdfTextExtractor");
  
  extractTextFromPDF(testPdfPath)
    .then((text) => {
      console.log("   ✅ Extraction successful!");
      console.log(`   Text length: ${text.length} characters`);
      console.log(`   Text preview: "${text.substring(0, 100)}"`);
      if (text.length === 0) {
        console.log("   ⚠️  WARNING: Extracted text is empty!");
      } else if (text.length < 50) {
        console.log("   ⚠️  WARNING: Extracted text is very short (< 50 chars)");
      }
    })
    .catch((err) => {
      console.error("   ❌ Extraction failed:", err.message);
    });
  
} catch (err) {
  console.error("   ❌ Error:", err.message);
}

console.log("\n" + "=".repeat(60));
console.log("Debug test complete!");
