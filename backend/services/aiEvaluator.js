const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function evaluateProjectAI(prompt) {
  try {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Invalid prompt - must be a string");
    }

    console.log("🔍 Starting AI evaluation with Gemini 2.5 Flash...");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Enhanced prompt with stricter validation
    const enhancedPrompt = `${prompt}

IMPORTANT INSTRUCTIONS:

1. **VALIDATE INPUT FIRST**: If the project information contains gibberish, random characters, or is clearly fake/invalid:
   
   Respond with:
   {
     "score": 0,
     "strengths": [
       "Unable to evaluate - project information appears invalid",
       "Please provide legitimate project details",
       "Ensure all fields contain real, technical information"
     ],
     "improvements": [
       "Provide a real project title with proper naming",
       "Describe an actual technical domain (e.g., Web Development, AI/ML, Mobile Apps)",
       "Write a meaningful project description with actual features and functionalities",
       "List genuine technologies used in the tech stack"
     ],
     "interviewReadiness": "Cannot assess interview readiness without valid project information. Please provide details about a real project you have worked on with actual technical implementation."
   }

2. **FOR VALID PROJECTS**: Provide comprehensive evaluation with:
   - **REALISTIC SCORING**: Don't default to high scores. Be critical and honest.
     * 0-20: Invalid/No real project
     * 21-40: Very basic, minimal features
     * 41-60: Simple project with standard features
     * 61-75: Good project with decent complexity
     * 76-85: Strong project with advanced features
     * 86-95: Excellent, near-production quality
     * 96-100: Outstanding, innovative, production-ready

   - **SPECIFIC STRENGTHS**: Based on actual tech stack and features (minimum 3)
   - **CONCRETE IMPROVEMENTS**: Tailored to the specific project (minimum 3)
   - **HONEST INTERVIEW READINESS**: Real assessment of preparedness

3. **BE CRITICAL**: 
   - Simple CRUD apps should score 40-55
   - Todo lists should score 30-45
   - Basic calculators should score 20-35
   - Only award high scores (75+) for genuinely complex projects

4. **ALWAYS return minimum 3 items** for both strengths and improvements arrays.

Return ONLY valid JSON (no markdown, no explanation):

{
  "score": number,
  "strengths": ["point1", "point2", "point3", ...],
  "improvements": ["point1", "point2", "point3", ...],
  "interviewReadiness": "assessment"
}`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty AI response");
    }

    // Clean up the response
    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, '');
    cleanedText = cleanedText.replace(/```\n?/g, '');
    cleanedText = cleanedText.replace(/^json\n?/gi, '');
    cleanedText = cleanedText.trim();

    console.log("📄 Cleaned AI Response:", cleanedText);
    console.log("✅ AI evaluation completed successfully");
    
    return cleanedText;

  } catch (error) {
    console.error("❌ Gemini AI Error:", error.message);
    throw error;
  }
}

module.exports = { evaluateProjectAI };