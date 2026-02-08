const axios = require("axios");

async function askAI(prompt, student) {
  const systemPrompt = `
You are a friendly AI placement mentor for college students.

Student details:
- Branch: ${student.branch}
- Year: ${student.year}
- CGPA: ${student.cgpa}

Rules:
- Be friendly, supportive, and motivating
- Keep answers SHORT (3–5 lines max)
- Use simple, casual language
- No big paragraphs
- Give practical advice only
`;

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "mistralai/mistral-7b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.choices[0].message.content;
}

module.exports = { askAI };