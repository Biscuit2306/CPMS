const axios = require("axios");

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }
const systemPrompt = `
You are a friendly student assistant for a college placement dashboard.

YOU CAN ANSWER ONLY ABOUT:
- Studies
- Exams
- CGPA
- Placements
- Internships
- Coding / DSA
- Projects
- Resume
- Interviews
- Student motivation

STYLE RULES:
- Sound like a senior student, not a teacher
- Replies must feel natural and conversational
- Maximum 1 sentence
- Maximum 12 words
- No lists
- No emojis
- No formal or robotic tone

IF QUESTION IS NOT STUDENT-RELATED:
Reply exactly:
"I’m here to help only with student and placement questions."
`;



    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      reply: response.data.choices[0].message.content
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "AI failed" });
  }
};