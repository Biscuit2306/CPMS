const express = require("express");
const axios = require("axios");
const InterviewSession = require("../models/InterviewSession");

const router = express.Router();

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

// Helper function to call Gemini API with fallback key
async function callGeminiAPI(prompt) {
  let primaryKey = process.env.GEMINI_API_KEY;
  let backupKey = process.env.GEMINI_API_KEY_BACKUP;
  
  // Try with primary key
  try {
    const response = await axios.post(
      GEMINI_URL,
      { contents: [{ parts: [{ text: prompt }] }] },
      { params: { key: primaryKey } }
    );
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (primaryError) {
    // If primary key fails with auth/quota error and backup exists, try backup
    if ((primaryError.response?.status === 401 || primaryError.response?.status === 403 || primaryError.response?.status === 429) && backupKey) {
      console.log(`🔄 Primary key failed (${primaryError.response?.status}). Trying backup key...`);
      try {
        const response = await axios.post(
          GEMINI_URL,
          { contents: [{ parts: [{ text: prompt }] }] },
          { params: { key: backupKey } }
        );
        return response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (backupError) {
        console.error("❌ Backup key also failed:", backupError.response?.data || backupError.message);
        throw backupError;
      }
    }
    throw primaryError;
  }
}

/* =========================
   START INTERVIEW
   POST /api/ai/start
   ========================= */
router.post("/start", async (req, res) => {
  try {
    const { studentFirebaseUid, role, level, techStack } = req.body;

    if (!studentFirebaseUid || !role || !level || !techStack?.length) {
      return res.status(400).json({ error: "Invalid interview data" });
    }

    // Create new interview session in database
    const session = await InterviewSession.create({
      studentFirebaseUid,
      role,
      level,
      techStack,
      currentQuestionNumber: 1,
      status: "in-progress",
    });

    console.log("Starting interview session:", session._id);

    const prompt = `
You are a technical interviewer.

STRICT RULES:
- Ask ONLY ONE interview question
- Do NOT explain
- Do NOT evaluate
- Do NOT give feedback

Role: ${role}
Level: ${level}
Tech Stack: ${techStack.join(", ")}

Ask question number 1.
`;

    let question;
    try {
      question = await callGeminiAPI(prompt);
    } catch (apiError) {
      console.error("❌ Gemini API failed:", apiError.response?.data || apiError.message);
      question = "Explain the concept of closures in JavaScript."; // fallback question
    }

    res.json({ 
      sessionId: session._id,
      question: question || "Failed to generate question" 
    });

  } catch (error) {
    console.error("❌ Start interview error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to start interview" });
  }
});

/* =========================
   SUBMIT ANSWER
   POST /api/ai/answer
   ========================= */
router.post("/answer", async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({ error: "Missing sessionId or answer" });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    if (session.status !== "in-progress") {
      return res.status(400).json({ error: "Interview session is not active" });
    }

    // Store question and answer
    session.questions.push({
      questionNumber: session.currentQuestionNumber,
      question: req.body.lastQuestion || "Question",
      answer,
      timestamp: new Date(),
    });

    session.currentQuestionNumber++;

    // Interview finished after 5 questions
    if (session.currentQuestionNumber > 5) {
      session.status = "completed";
      session.completedAt = new Date();
      await session.save();
      return res.json({ done: true, message: "Interview completed" });
    }

    await session.save();

    const prompt = `
You are a technical interviewer.

STRICT RULES:
- Ask ONLY ONE interview question
- Do NOT explain
- Do NOT evaluate previous answers

Role: ${session.role}
Level: ${session.level}
Tech Stack: ${session.techStack.join(", ")}

Ask question number ${session.currentQuestionNumber}.
`;

    let nextQuestion;
    try {
      nextQuestion = await callGeminiAPI(prompt);
    } catch (apiError) {
      console.error("❌ Gemini API failed:", apiError.response?.data || apiError.message);
      nextQuestion = `Please explain a concept related to ${session.techStack[0]}.`; // fallback
    }

    res.json({ nextQuestion: nextQuestion || "Failed to generate next question" });

  } catch (error) {
    console.error("❌ Answer error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to process answer" });
  }
});

/* =========================
   FINAL EVALUATION
   POST /api/ai/evaluate
   ========================= */
router.post("/evaluate", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    const prompt = `
You are a strict technical interviewer.

Evaluate the candidate's overall interview performance based on all answers:

${session.questions.map(q => `Q${q.questionNumber}: ${q.answer}`).join("\n")}

Return ONLY valid JSON in this format:
{
  "score": number (0-100),
  "strengths": [string],
  "weaknesses": [string],
  "suggestions": [string]
}
`;

    let feedbackText;
    try {
      feedbackText = await callGeminiAPI(prompt) || "";
    } catch (apiError) {
      console.error("❌ Gemini API failed:", apiError.response?.data || apiError.message);
      feedbackText = "";
    }

    // Safe JSON extraction
    const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
    const feedback = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      score: 50,
      strengths: ["Evaluation partially failed"],
      weaknesses: [],
      suggestions: ["Retry interview"]
    };

    // Save feedback to session
    session.feedback = feedback;
    session.status = "completed";
    session.completedAt = new Date();
    await session.save();

    res.json(feedback);

  } catch (error) {
    console.error("❌ Evaluation error:", error.response?.data || error.message);
    res.status(200).json({
      score: 50,
      strengths: ["Evaluation could not be fully generated"],
      weaknesses: ["Retry interview for more accurate feedback"],
      suggestions: ["Ensure all questions are answered properly"]
    });
  }
});

/* =========================
   GET INTERVIEW HISTORY
   GET /api/ai/history/:studentFirebaseUid
   ========================= */
router.get("/history/:studentFirebaseUid", async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      studentFirebaseUid: req.params.studentFirebaseUid,
      status: "completed",
    }).sort({ completedAt: -1 });

    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error("❌ History fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

module.exports = router;
