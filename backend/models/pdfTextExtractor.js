const fs = require("fs");
const path = require("path");

const extractTextFromPDF = async (filePath) => {
  console.log(`   📖 extractTextFromPDF called with: ${filePath}`);
  
  // Normalize path to handle any issues
  let normalizedPath = path.normalize(filePath);
  console.log(`   📖 Normalized path: ${normalizedPath}`);
  
  // If it's a relative path, try to resolve it from the backend directory
  if (!path.isAbsolute(normalizedPath)) {
    const backendDir = __dirname.replace(/\\utils$/, ''); // Remove /utils from end
    normalizedPath = path.join(backendDir, normalizedPath);
    console.log(`   📖 Converted to absolute path: ${normalizedPath}`);
  }
  
  if (!fs.existsSync(normalizedPath)) {
    console.error(`   ❌ File does not exist at: ${normalizedPath}`);
    throw new Error(`Resume file not found at: ${normalizedPath}`);
  }

  console.log(`   ✅ File exists, checking size...`);
  const stats = fs.statSync(normalizedPath);
  console.log(`   📊 File size: ${stats.size} bytes`);

  try {
    // Try using pdfjs-dist first (more reliable)
    console.log(`   📖 Attempting pdfjs-dist extraction...`);
    const pdfjs = require("pdfjs-dist/legacy/build/pdf");
    const dataBuffer = fs.readFileSync(normalizedPath);
    
    console.log(`   📖 PDF loaded, parsing...`);
    const pdf = await pdfjs.getDocument({ data: dataBuffer }).promise;
    console.log(`   📖 PDF has ${pdf.numPages} pages`);
    
    let fullText = "";
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + " ";
    }
    
    const extractedLength = fullText.trim().length;
    console.log(`   ✅ pdfjs-dist extraction successful (${extractedLength} characters)`);
    
    if (extractedLength === 0) {
      console.warn(`   ⚠️ PDF extracted but contains no text`);
    }
    
    return fullText.trim();
  } catch (pdfjsErr) {
    console.warn(`   ⚠️ pdfjs-dist failed: ${pdfjsErr.message}`);
    
    try {
      // Fallback: Try pdf-parse
      console.log(`   📖 Attempting pdf-parse extraction...`);
      const pdfParse = require("pdf-parse");
      const dataBuffer = fs.readFileSync(normalizedPath);
      const data = await pdfParse(dataBuffer);
      
      const extractedLength = (data.text || "").length;
      console.log(`   ✅ pdf-parse extraction successful (${extractedLength} characters)`);
      
      if (extractedLength === 0) {
        console.warn(`   ⚠️ PDF extracted but contains no text`);
      }
      
      return data.text || "";
    } catch (pdfParseErr) {
      console.warn(`   ⚠️ pdf-parse failed: ${pdfParseErr.message}`);
      
      // Both methods failed
      console.error(`❌ All PDF extraction methods failed for: ${normalizedPath}`);
      throw new Error(`PDF extraction failed: ${pdfjsErr.message || pdfParseErr.message}`);
    }
  }
};

module.exports = { extractTextFromPDF };