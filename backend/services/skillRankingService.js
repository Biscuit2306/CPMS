const { GoogleGenerativeAI } = require("@google/generative-ai");
const Student = require("../models/Student");
const { extractTextFromPDF } = require("../utils/pdfTextExtractor");
const mongoose = require("mongoose");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}

console.log("🔑 Initializing Gemini AI with API key: " + process.env.GEMINI_API_KEY.substring(0, 10) + "...");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Rank candidates based on resume content and skills
 * @param {Array} candidateIds - Array of candidate IDs to rank
 * @param {String} jobDescription - Job requirement description
 * @returns {Array} - Sorted array of candidates with skill scores
 */
async function rankCandidatesBySkills(candidateIds, jobDescription) {
  try {
    console.log("🔍 Starting AI-powered candidate skill ranking...");
    console.log("📊 Received candidate IDs:", candidateIds);
    console.log("📊 ID types:", candidateIds.map(id => typeof id));

    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      throw new Error("Invalid candidate IDs");
    }

    // Ensure all IDs are strings
    const sanitizedIds = candidateIds.map(id => String(id).trim()).filter(id => id);
    console.log("📊 Sanitized IDs:", sanitizedIds);

    // Fetch all candidate data - use firebaseUid since candidateIds are Firebase UIDs
    console.log("🔍 Querying database with native MongoDB driver (avoiding Mongoose casting)");
    
    let candidates;
    try {
      // Primary: Use native MongoDB driver to completely bypass Mongoose schema validation
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error("Database connection not available");
      }
      
      const collection = db.collection('students');
      candidates = await collection.find(
        { firebaseUid: { $in: sanitizedIds } },
        { projection: { fullName: 1, email: 1, resume: 1, github: 1, portfolio: 1, branch: 1, year: 1, cgpa: 1, linkedin: 1, firebaseUid: 1, _id: 1 } }
      ).toArray();
      
      console.log(`✅ Found ${candidates.length} students using native MongoDB driver`);
      if (candidates.length > 0) {
        console.log("📊 First candidate:", {
          name: candidates[0].fullName,
          uid: candidates[0].firebaseUid,
          mongoId: candidates[0]._id?.toString() || 'N/A',
        });
      }
    } catch (dbError) {
      console.error("❌ Native MongoDB query failed:", dbError.message);
      console.error("   Stack:", dbError.stack);
      throw new Error(`Failed to fetch candidates from database: ${dbError.message}`);
    }

    if (candidates.length === 0) {
      console.log("❌ No candidates found with IDs:", sanitizedIds);
      throw new Error("No candidates found in database");
    }

    // Validate that all candidates have required fields
    candidates.forEach((c, idx) => {
      if (!c.firebaseUid) {
        console.warn(`⚠️ Candidate ${idx} missing firebaseUid`);
      }
      if (!c._id) {
        console.warn(`⚠️ Candidate ${idx} missing _id`);
      }
    });

    // Convert _id to string to avoid ObjectId issues
    const candidatesWithStringIds = candidates.map(c => ({
      ...c,
      _id: c._id?.toString ? c._id.toString() : String(c._id),
    }));

    console.log(`📋 Evaluating ${candidatesWithStringIds.length} candidates...`);

    // Rank each candidate
    const rankedCandidates = await Promise.all(
      candidatesWithStringIds.map(async (candidate) => {
        console.log(`\n🎯 Evaluating candidate: ${candidate.fullName} (${candidate.firebaseUid})`);
        try {
          console.log(`   📋 Has resume: ${candidate.resume ? "Yes" : "No"}`);
          if (candidate.resume) {
            console.log(`   📄 Resume path: ${candidate.resume.substring(0, 100)}`);
          }
          
          const rankingData = await evaluateCandidateSingleSkills(
            candidate,
            jobDescription
          );

          // Check if evaluation returned a score of 0 due to error
          if (rankingData.skillScore === 0 && rankingData.fitRating === "Error") {
            console.log(`   ⚠️ Candidate evaluation failed with error`);
          } else {
            console.log(`   ✅ Evaluation complete - Score: ${rankingData.skillScore}`);
          }

          return {
            _id: candidate._id,
            studentId: candidate.firebaseUid,
            firebaseUid: candidate.firebaseUid,
            name: candidate.fullName || "N/A",
            email: candidate.email || "N/A",
            branch: candidate.branch || "N/A",
            year: candidate.year || "N/A",
            cgpa: candidate.cgpa || "N/A",
            github: candidate.github || "",
            linkedin: candidate.linkedin || "",
            portfolio: candidate.portfolio || "",
            ...rankingData,
          };
        } catch (error) {
          console.error(`\n❌ Error evaluating candidate ${candidate.firebaseUid}:`);
          console.error(`   Error message: ${error.message}`);
          console.error(`   Error details: ${error.stack}`);
          
          // Return result WITH error details so frontend knows what went wrong
          return {
            _id: candidate._id,
            studentId: candidate.firebaseUid,
            firebaseUid: candidate.firebaseUid,
            name: candidate.fullName || "N/A",
            email: candidate.email || "N/A",
            branch: candidate.branch || "N/A",
            year: candidate.year || "N/A",
            cgpa: candidate.cgpa || "N/A",
            skillScore: 0,
            skills: [],
            topStrengths: [],
            recommendations: [],
            fitRating: "Error",
            summary: "Unable to evaluate",
            error: `Evaluation failed: ${error.message}`,
            resumePath: candidate.resume || "No resume",
          };
        }
      })
    );

    // Sort by skill score (descending)
    const sortedCandidates = rankedCandidates.sort(
      (a, b) => (b.skillScore || 0) - (a.skillScore || 0)
    );

    console.log("✅ Candidate ranking completed successfully");

    return sortedCandidates;
  } catch (error) {
    console.error("❌ Skill Ranking Error:", error.message);
    throw error;
  }
}

/**
 * Evaluate single candidate's skills using AI based on resume
 */
async function evaluateCandidateSingleSkills(candidate, jobDescription) {
  try {
    // Check if evaluation is already cached for this candidate
    if (candidate.skillEvaluation && candidate.skillEvaluation.cachedAt) {
      const cacheAge = Date.now() - new Date(candidate.skillEvaluation.cachedAt).getTime();
      const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
      if (cacheAge < CACHE_DURATION) {
        console.log(`   ✅ Using cached evaluation (cached ${Math.floor(cacheAge / 1000 / 60)} minutes ago)`);
        return candidate.skillEvaluation.result;
      }
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    console.log(`   📄 Processing resume for evaluation...`);

    // Extract resume text
    let resumeText = "";
    if (candidate.resume) {
      if (typeof candidate.resume === 'string') {
        // Resume is text content stored in DB (from test-resume-setup.js)
        resumeText = candidate.resume;
        console.log(`   ✅ Resume text found (${resumeText.length} characters)`);
      }
    } else {
      console.log(`   ⚠️ No resume available for candidate`);
    }

    // Build evaluation context
    let evaluationContext = `CANDIDATE INFORMATION
=====================
Name: ${candidate.fullName || "N/A"}
Email: ${candidate.email || "N/A"}
Branch: ${candidate.branch || "N/A"}
Year: ${candidate.year || "N/A"}
CGPA: ${candidate.cgpa || "N/A"}/10
GitHub: ${candidate.github || "Not provided"}
LinkedIn: ${candidate.linkedin || "Not provided"}
Portfolio: ${candidate.portfolio || "Not provided"}
`;

    // Add resume content if available
    if (resumeText) {
      evaluationContext += `

CANDIDATE RESUME
================
${resumeText}
`;
    }

    const prompt = `
You are an expert recruiter evaluating candidates based on their resume and background.

${evaluationContext}

Job Requirements:
${jobDescription || "General IT position"}

TASK: Evaluate this candidate's skills and fit for the job.

EVALUATION GUIDELINES:
1. Analyze the resume to extract technical skills, experience, and expertise
2. Match skills against job requirements
3. Assess overall suitability for the position
4. Provide realistic skill scores (40-100 range)
5. Return valid JSON with no markdown or explanations

Return ONLY valid JSON:

{
  "skillScore": number (40-100),
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "topStrengths": ["strength1", "strength2", "strength3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "fitRating": "string (Excellent/Good/Average/Below Average)",
  "summary": "brief evaluation (max 100 words)"
}
`;

    console.log(`   🤖 Calling Gemini API with resume...`);
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0, // Set to 0 for deterministic/consistent responses
        topP: 0.8,
        topK: 40,
      },
    });
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty AI response for skill evaluation");
    }

    console.log(`   ✅ AI response received (${text.length} characters)`);

    // Clean up the response
    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, "");
    cleanedText = cleanedText.replace(/```\n?/g, "");
    cleanedText = cleanedText.replace(/^json\n?/gi, "");
    cleanedText = cleanedText.trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
      console.log(`   ✅ JSON parsed successfully`);
    } catch (parseError) {
      console.error(`   ❌ JSON parse error: ${parseError.message}`);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    // Ensure skillScore is valid
    let skillScore = parsedData.skillScore || 50;
    if (typeof skillScore !== 'number') {
      skillScore = parseInt(skillScore) || 50;
    }
    // Ensure score in valid range
    skillScore = Math.max(40, Math.min(100, skillScore));

    console.log(`   🎯 FINAL SKILL SCORE: ${skillScore}`);

    const evaluationResult = {
      skillScore: skillScore,
      skills: (parsedData.skills || []).slice(0, 5),
      topStrengths: (parsedData.topStrengths || []).slice(0, 3),
      recommendations: (parsedData.recommendations || []).slice(0, 3),
      fitRating: parsedData.fitRating || "Average",
      summary: parsedData.summary || "Resume-based evaluation completed",
    };

    // Cache the evaluation result in database for future use
    try {
      await Student.updateOne(
        { _id: candidate._id },
        {
          skillEvaluation: {
            result: evaluationResult,
            cachedAt: new Date(),
          },
        }
      );
      console.log(`   💾 Evaluation cached in database`);
    } catch (cacheError) {
      console.warn(`   ⚠️ Could not cache evaluation: ${cacheError.message}`);
    }

    return evaluationResult;
  } catch (error) {
    console.error(`❌ Error in evaluateCandidateSingleSkills: ${error.message}`);
    console.error(`   Error type: ${error.name}`);
    throw error;
  }
}

module.exports = { rankCandidatesBySkills, evaluateCandidateSingleSkills };
