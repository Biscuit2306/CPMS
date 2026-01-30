const express = require("express");
const { callGemini } = require("../utils/gemini");

const router = express.Router();

router.post("/start", async (req, res) => {
  const { role, level, techStack } = req.body;

  const prompt = `
You are a professional interviewer.
Ask ONE question only.

Role: ${role}
Level: ${level}
Tech Stack: ${techStack.join(", ")}
`;

  const question = await callGemini(prompt);
  res.json({ question });
});

module.exports = router;
