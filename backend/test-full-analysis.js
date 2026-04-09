#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

// Load environment variables
require("dotenv").config();

const axios = require("axios");
const { extractTextFromPDF } = require("./utils/pdfTextExtractor");
const ResumeAnalysis = require("./models/ResumeAnalysis");

console.log("🧪 RESUME ANALYSIS END-TO-END TEST\n");
console.log("=".repeat(60));

async function testResumeAnalysis() {
  try {
    // Step 1: Extract text from a sample resume
    console.log("1️⃣  Extracting PDF text...");
    const resumeDir = path.join(__dirname, "uploads", "resumes");
    const files = fs.readdirSync(resumeDir).filter(f => f.endsWith(".pdf"));
    
    if (files.length === 0) {
      throw new Error("No PDF files found in uploads/resumes");
    }
    
    const resumePath = path.join(resumeDir, files[0]);
    const resumeText = await extractTextFromPDF(resumePath);
    
    console.log(`   ✅ Text extracted: ${resumeText.length} characters`);
    console.log(`   Preview: ${resumeText.substring(0, 100)}...`);
    
    if (resumeText.length < 50) {
      throw new Error("Resume text too short for analysis");
    }
    
    // Step 2: Call OpenRouter API
    console.log("\n2️⃣  Calling OpenRouter API for analysis...");
    
    const openRouterResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",  // ✅ Auto-select best available model
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `You are a professional ATS Resume Reviewer for SOFTWARE ENGINEERING internships and entry-level roles.

IMPORTANT: Return ONLY valid JSON with NO markdown, NO explanations, NO code blocks.

{
  "atsScore": number (0-100),
  "missingKeywords": string[],
  "weakSections": string[],
  "improvements": string[],
  "suggestedProjects": string[],
  "suggestedBulletPoints": string[]
}`
          },
          {
            role: "user",
            content: `Analyze this resume and return ONLY JSON:\n\n${resumeText.substring(0, 2000)}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Student Placement Dashboard"
        }
      }
    );
    
    console.log("   ✅ API Response received");
    const aiText = openRouterResponse.data.choices?.[0]?.message?.content || "";
    console.log(`   Raw response (first 150 chars): ${aiText.substring(0, 150)}...`);
    
    // Step 3: Parse JSON
    console.log("\n3️⃣  Parsing AI response...");
    const cleaned = aiText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    console.log("   ✅ JSON parsed successfully");
    console.log(`   ATS Score: ${parsed.atsScore}`);
    console.log(`   Missing Keywords: ${parsed.missingKeywords?.length || 0} items`);
    console.log(`   Weak Sections: ${parsed.weakSections?.length || 0} items`);
    console.log(`   Improvements: ${parsed.improvements?.length || 0} items`);
    
    console.log("\n" + "=".repeat(60));
    console.log("✨ FULL ANALYSIS PIPELINE WORKING!");
    console.log("   ✅ PDF extraction");
    console.log("   ✅ Text conversion");
    console.log("   ✅ API analysis");
    console.log("   ✅ JSON parsing");
    
  } catch (err) {
    console.error("\n❌ Error:", err.message);
    if (err.response?.data) {
      console.error("   API Error details:", JSON.stringify(err.response.data, null, 2));
    }
  }
}

testResumeAnalysis();
