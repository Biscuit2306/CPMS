const express = require("express");
const axios = require("axios");

const router = express.Router();

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

/* =========================
   IN-MEMORY INTERVIEW STATE
   ========================= */
let interviewSession = {
  role: "",
  level: "",
  techStack: [],
  answers: [],
  questionNumber: 1
};

/* =========================
   START INTERVIEW
   POST /api/ai/start
   ========================= */
router.post("/start", async (req, res) => {
  try {
    const { role, level, techStack } = req.body;

    if (!role || !level || !techStack?.length) {
      return res.status(400).json({ error: "Invalid interview data" });
    }

    // reset session
    interviewSession = {
      role,
      level,
      techStack,
      answers: [],
      questionNumber: 1
    };

    console.log("Starting interview session:", interviewSession);

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
      const response = await axios.post(
        GEMINI_URL,
        { contents: [{ parts: [{ text: prompt }] }] },
        { params: { key: process.env.GEMINI_API_KEY } }
      );

      question = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (apiError) {
      console.error("❌ Gemini API failed:", apiError.response?.data || apiError.message);
      question = "Explain the concept of closures in JavaScript."; // fallback question
    }

    res.json({ question: question || "Failed to generate question" });

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
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({ error: "Answer is required" });
    }

    // store answer
    interviewSession.answers.push({
      questionNumber: interviewSession.questionNumber,
      answer
    });

    interviewSession.questionNumber++;

    // interview finished
    if (interviewSession.questionNumber > 5) {
      return res.json({ done: true });
    }

    const prompt = `
You are a technical interviewer.

STRICT RULES:
- Ask ONLY ONE interview question
- Do NOT explain
- Do NOT evaluate previous answers

Role: ${interviewSession.role}
Level: ${interviewSession.level}
Tech Stack: ${interviewSession.techStack.join(", ")}

Ask question number ${interviewSession.questionNumber}.
`;

    let nextQuestion;
    try {
      const response = await axios.post(
        GEMINI_URL,
        { contents: [{ parts: [{ text: prompt }] }] },
        { params: { key: process.env.GEMINI_API_KEY } }
      );

      nextQuestion = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (apiError) {
      console.error("❌ Gemini API failed:", apiError.response?.data || apiError.message);
      nextQuestion = `Please explain a concept related to ${interviewSession.techStack[0]}.`; // fallback
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
    const prompt = `
You are a strict technical interviewer.

Evaluate the candidate's overall interview performance based on all answers:

${interviewSession.answers.map(a => `Q${a.questionNumber}: ${a.answer}`).join("\n")}

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
      const response = await axios.post(
        GEMINI_URL,
        { contents: [{ parts: [{ text: prompt }] }] },
        {
          params: { key: process.env.GEMINI_API_KEY },
          headers: { "Content-Type": "application/json" }
        }
      );

      feedbackText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (apiError) {
      console.error("❌ Gemini API failed:", apiError.response?.data || apiError.message);
      feedbackText = "";
    }

    // 🔹 Safe JSON extraction
    const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
    const feedback = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      score: 50,
      strengths: ["Evaluation partially failed"],
      weaknesses: [],
      suggestions: ["Retry interview"]
    };

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

module.exports = router;
