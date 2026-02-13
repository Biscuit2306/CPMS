const path = require("path");
const axios = require("axios");

const Student = require("../models/Student");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const { extractTextFromPDF } = require("../utils/pdfTextExtractor");

// ✅ Helper: Always convert AI arrays into string[]
const safeStringArray = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();

      // If AI returns object/number, convert into readable string
      if (typeof item === "object" && item !== null) {
        return Object.entries(item)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
      }

      return String(item).trim();
    })
    .filter(Boolean);
};

const uploadStudentResume = async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: "firebaseUid is required" });
    }

    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({ error: "Resume PDF is required" });
    }

    const student = await Student.findOne({ firebaseUid });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const fileUrl = `/uploads/resumes/${resumeFile.filename}`;

    student.resume = fileUrl;
    await student.save();

    return res.status(200).json({
      message: "Resume uploaded successfully",
      resumeUrl: fileUrl
    });
  } catch (err) {
    return res.status(500).json({
      error: "Resume upload failed",
      details: err.message
    });
  }
};

const analyzeStudentResume = async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: "firebaseUid is required" });
    }

    const student = await Student.findOne({ firebaseUid });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (!student.resume) {
      return res.status(400).json({ error: "No resume uploaded yet" });
    }

    const filePath = path.join(
      __dirname,
      "..",
      student.resume.replace(/^\//, "")
    );

    const resumeText = await extractTextFromPDF(filePath);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: "Resume text could not be extracted properly"
      });
    }

    const openRouterResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `
You are a professional ATS Resume Reviewer for SOFTWARE ENGINEERING internships and entry-level roles.

IMPORTANT RULES:
- Return ONLY valid JSON (no markdown, no explanations).
- Do NOT invent skills, projects, or experience.
- Be highly specific and resume-based.
- Avoid generic advice like "improve formatting".
- Suggestions must be actionable and detailed.

OUTPUT FORMAT (EXACT KEYS ONLY):
{
  "atsScore": number (0-100),
  "missingKeywords": string[],
  "weakSections": string[],
  "improvements": string[],
  "suggestedProjects": string[],
  "suggestedBulletPoints": string[]
}

QUALITY RULES:
- missingKeywords must contain REAL ATS keywords (skills/tools/frameworks) that are missing.
- weakSections must mention specific sections like: Projects, Skills, Experience, Education, Summary.
- improvements must be written like: "Fix: ... | Why: ... | Example: ..."
- suggestedProjects must include title + tech stack + 1-line reason.
- suggestedBulletPoints must be rewritten strong bullets with metrics.

ATS SCORING GUIDELINE:
- 90-100: strong projects + metrics + keywords + clean structure
- 70-89: good but missing keywords or metrics
- 50-69: average; weak bullets, weak projects, missing core skills
- <50: incomplete, unclear, or very weak
`
          },
          {
            role: "user",
            content: `
Analyze this resume text carefully and return the JSON output:

${resumeText}
`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiText =
      openRouterResponse.data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (e) {
      parsed = {
        atsScore: 0,
        missingKeywords: [],
        weakSections: [],
        improvements: [],
        suggestedProjects: [],
        suggestedBulletPoints: [],
        rawAIResponse: aiText
      };
    }

    // ✅ Fix atsScore type
    parsed.atsScore = Number(parsed.atsScore) || 0;

    // ✅ Force arrays to be string[]
    parsed.missingKeywords = safeStringArray(parsed.missingKeywords);
    parsed.weakSections = safeStringArray(parsed.weakSections);
    parsed.improvements = safeStringArray(parsed.improvements);
    parsed.suggestedProjects = safeStringArray(parsed.suggestedProjects);
    parsed.suggestedBulletPoints = safeStringArray(parsed.suggestedBulletPoints);

    const analysis = await ResumeAnalysis.create({
      firebaseUid,
      resumeFileName: student.resume.split("/").pop(),
      resumeFileUrl: student.resume,
      atsScore: parsed.atsScore,
      missingKeywords: parsed.missingKeywords,
      weakSections: parsed.weakSections,
      improvements: parsed.improvements,
      suggestedProjects: parsed.suggestedProjects,
      suggestedBulletPoints: parsed.suggestedBulletPoints,
      rawAIResponse: aiText
    });

    return res.status(200).json({
      message: "Resume analyzed successfully",
      analysis
    });
  } catch (err) {
    console.log("❌ ANALYZE ERROR:", err);

    return res.status(500).json({
      error: "Resume analysis failed",
      details: err.message
    });
  }
};

const getLatestResumeAnalysis = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const latest = await ResumeAnalysis.findOne({ firebaseUid }).sort({
      createdAt: -1
    });

    if (!latest) {
      return res.status(404).json({ error: "No analysis found" });
    }

    return res.status(200).json(latest);
  } catch (err) {
    return res.status(500).json({
      error: "Failed to fetch analysis",
      details: err.message
    });
  }
};

module.exports = {
  uploadStudentResume,
  analyzeStudentResume,
  getLatestResumeAnalysis
};