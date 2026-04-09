const axios = require("axios");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second initial delay

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function evaluateProjectAI(prompt) {
  try {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Invalid prompt - must be a string");
    }

    console.log("🔍 Starting AI evaluation with Gemini 2.5 Flash via REST API...");

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

    let text;
    let attempt = 0;
    let currentKey = process.env.GEMINI_API_KEY;
    let keyFailures = 0;

    // Retry logic for 503 errors and fallback to backup key on auth failures
    while (attempt < MAX_RETRIES) {
      try {
        console.log(`📤 Sending request to AI (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        
        const response = await axios.post(
          GEMINI_URL,
          { contents: [{ parts: [{ text: enhancedPrompt }] }] },
          { params: { key: currentKey } }
        );

        text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) break; // Success - exit retry loop
      } catch (apiError) {
        attempt++;
        const statusCode = apiError.response?.status;
        
        // Try backup key on auth/quota errors (401, 403, 429)
        if ((statusCode === 401 || statusCode === 403 || statusCode === 429) && keyFailures === 0 && process.env.GEMINI_API_KEY_BACKUP) {
          keyFailures++;
          currentKey = process.env.GEMINI_API_KEY_BACKUP;
          console.log(`🔄 Primary key failed (${statusCode}). Switching to backup key...`);
          attempt--; // Don't count this as a retry
          continue;
        }
        
        // Retry on 503 (Service Unavailable)
        if (statusCode === 503 && attempt < MAX_RETRIES) {
          const delayMs = RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ API temporarily unavailable (503). Retrying in ${delayMs}ms...`);
          await sleep(delayMs);
          continue;
        }
        
        // Other errors - throw immediately
        console.error("❌ Gemini API failed:", apiError.response?.data || apiError.message);
        throw apiError;
      }
    }

    if (!text) {
      throw new Error("Empty AI response after retries");
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