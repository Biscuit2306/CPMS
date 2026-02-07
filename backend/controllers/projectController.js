const ProjectEvaluation = require("../models/ProjectEvaluation");
const { evaluateProjectAI } = require("../services/aiEvaluator");
const { analyzeGitHubRepo } = require("../services/githubAnalyzer");

// ===============================
// 📊 EVALUATE PROJECT
// ===============================
exports.evaluateProject = async (req, res) => {
  try {
    const { title, domain, description, techStack, repoUrl } = req.body;

    // ------------------
    // VALIDATION
    // ------------------
    if (!title || !domain || !description || !techStack) {
      return res.status(400).json({
        success: false,
        message: "Missing required project details",
      });
    }

    // ------------------
    // GITHUB ANALYSIS (OPTIONAL)
    // ------------------
    let githubAnalysis = null;

    if (repoUrl && repoUrl.trim()) {
      try {
        githubAnalysis = await analyzeGitHubRepo(repoUrl.trim());

        if (!githubAnalysis.valid) {
          return res.status(400).json({
            success: false,
            message: `GitHub repository error: ${githubAnalysis.error}`,
          });
        }

        console.log("📊 GitHub Analysis:", {
          stars: githubAnalysis.stars,
          languages: githubAnalysis.languages,
          size: githubAnalysis.size,
        });
      } catch (githubError) {
        console.error("❌ GitHub Analyzer Failed:", githubError.message);
        githubAnalysis = null; // fail-safe
      }
    }

    // ------------------
    // BUILD AI PROMPT
    // ------------------
    let prompt = `You are a senior technical recruiter evaluating a student project.

Project Details:
- Title: ${title}
- Domain: ${domain}
- Description: ${description}
- Tech Stack: ${techStack}
`;

    if (githubAnalysis) {
      prompt += `
GitHub Repository Analysis:
- Repository Name: ${githubAnalysis.name}
- Description: ${githubAnalysis.description}
- Stars: ${githubAnalysis.stars}
- Forks: ${githubAnalysis.forks}
- Size: ${githubAnalysis.size} KB
- Languages Used: ${Object.entries(githubAnalysis.languages)
        .map(([lang, pct]) => `${lang} (${pct}%)`)
        .join(", ")}
- Topics/Tags: ${githubAnalysis.topics.join(", ") || "None"}
- Last Updated: ${githubAnalysis.updatedAt}
- License: ${githubAnalysis.license}
- Has Documentation: ${githubAnalysis.hasReadme ? "Yes" : "No"}

IMPORTANT:
- Compare languages with tech stack
- Consider repository activity and size
- Be realistic and critical
`;
    }

    prompt += `
Respond with ONLY valid JSON (no markdown, no explanation):

{
  "score": number,
  "strengths": ["point1", "point2", "point3"],
  "improvements": ["point1", "point2", "point3"],
  "interviewReadiness": "assessment"
}
`;

    console.log("📤 Sending request to AI...");

    // ------------------
    // AI EVALUATION
    // ------------------
    const aiResponse = await evaluateProjectAI(prompt);

    if (!aiResponse || typeof aiResponse !== "string") {
      throw new Error("AI did not return a valid response");
    }

    // Clean Gemini markdown if any
    const cleanedResponse = aiResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    console.log("🧠 RAW AI RESPONSE:", cleanedResponse);

    let aiResult;
    try {
      aiResult = JSON.parse(cleanedResponse);
    } catch (err) {
      console.error("❌ JSON PARSE FAILED:", err.message);
      throw new Error("AI returned invalid JSON");
    }

    // ------------------
    // AI RESPONSE VALIDATION
    // ------------------
    if (
      typeof aiResult.score !== "number" ||
      aiResult.score < 0 ||
      aiResult.score > 100
    ) {
      throw new Error("Invalid score from AI");
    }

    if (!Array.isArray(aiResult.strengths) || aiResult.strengths.length < 3) {
      throw new Error("AI must return at least 3 strengths");
    }

    if (
      !Array.isArray(aiResult.improvements) ||
      aiResult.improvements.length < 3
    ) {
      throw new Error("AI must return at least 3 improvements");
    }

    if (!aiResult.interviewReadiness) {
      throw new Error("Missing interview readiness field");
    }

    console.log("✅ AI evaluation validated");

    // ------------------
    // SAVE TO DATABASE
    // ------------------
    const evaluation = await ProjectEvaluation.create({
      title,
      domain,
      techStack,
      repoUrl: repoUrl || null,
      score: aiResult.score,
      strengths: aiResult.strengths,
      improvements: aiResult.improvements,
      interviewReadiness: aiResult.interviewReadiness,
    });

    console.log("💾 Evaluation saved");

    return res.status(201).json({
      success: true,
      data: evaluation,
      githubAnalysis,
    });

  } catch (error) {
    console.error("❌ Project Evaluation Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Project evaluation failed",
    });
  }
};

// ===============================
// 📜 GET HISTORY
// ===============================
exports.getEvaluationHistory = async (req, res) => {
  try {
    const history = await ProjectEvaluation.find()
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("❌ History Fetch Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch evaluation history",
    });
  }
};

// ===============================
// 🗑 DELETE EVALUATION
// ===============================
exports.deleteEvaluation = async (req, res) => {
  try {
    await ProjectEvaluation.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};
