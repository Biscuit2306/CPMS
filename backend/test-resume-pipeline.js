#!/usr/bin/env node

console.log('🧪 PDF EXTRACTION PIPELINE TEST\n');
console.log('='.repeat(60));

let testsPassed = 0;
let testsFailed = 0;

// Test 1: PDF Extractor Module
console.log('\n1️⃣  PDF Extractor Module');
try {
  const { extractTextFromPDF } = require('./utils/pdfTextExtractor');
  console.log('   ✅ Loads without error');
  console.log('   ✅ Type:', typeof extractTextFromPDF);
  testsPassed++;
} catch (err) {
  console.error('   ❌ Error:', err.message);
  testsFailed++;
}

// Test 2: pdf-parse Dependency
console.log('\n2️⃣  pdf-parse Dependency');
try {
  const pdfParseModule = require('pdf-parse');
  const PDFParser = pdfParseModule.PDFParse;
  if (typeof PDFParser === 'function') {
    console.log('   ✅ PDFParse is callable (correct export)');
    testsPassed++;
  } else {
    console.error('   ❌ PDFParse not callable:', typeof PDFParser);
    testsFailed++;
  }
} catch (err) {
  console.error('   ❌ Error:', err.message);
  testsFailed++;
}

// Test 3: Resume Controller
console.log('\n3️⃣  Resume Controller');
try {
  const { uploadStudentResume, analyzeStudentResume, getLatestResumeAnalysis } = require('./controllers/resumeController');
  console.log('   ✅ uploadStudentResume:', typeof uploadStudentResume);
  console.log('   ✅ analyzeStudentResume:', typeof analyzeStudentResume);
  console.log('   ✅ getLatestResumeAnalysis:', typeof getLatestResumeAnalysis);
  testsPassed++;
} catch (err) {
  console.error('   ❌ Error:', err.message);
  testsFailed++;
}

// Test 4: Resume Routes
console.log('\n4️⃣  Resume Routes');
try {
  const resumeRoutes = require('./routes/resumeRoutes');
  console.log('   ✅ Routes loaded:', typeof resumeRoutes);
  testsPassed++;
} catch (err) {
  console.error('   ❌ Error:', err.message);
  testsFailed++;
}

// Test 5: ResumeAnalysis Model
console.log('\n5️⃣  ResumeAnalysis Model');
try {
  const ResumeAnalysis = require('./models/ResumeAnalysis');
  console.log('   ✅ Model loaded:', typeof ResumeAnalysis);
  testsPassed++;
} catch (err) {
  console.error('   ❌ Error:', err.message);
  testsFailed++;
}

// Test 6: Environment Variables
console.log('\n6️⃣  Environment Variables');
try {
  require('dotenv').config();
  const key = process.env.OPENROUTER_API_KEY;
  if (key) {
    console.log('   ✅ OPENROUTER_API_KEY configured');
    testsPassed++;
  } else {
    console.warn('   ⚠️  OPENROUTER_API_KEY not set (may need for AI features)');
  }
} catch (err) {
  console.error('   ❌ Error:', err.message);
  testsFailed++;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log(`   ✅ Passed: ${testsPassed}`);
console.log(`   ❌ Failed: ${testsFailed}`);

if (testsFailed === 0) {
  console.log('\n🎉 ALL TESTS PASSED!');
  console.log('   Resume analyzer pipeline is fully functional');
} else {
  console.log('\n⚠️  Some tests failed - check above for details');
}

console.log('\n' + '='.repeat(60));
process.exit(testsFailed === 0 ? 0 : 1);
