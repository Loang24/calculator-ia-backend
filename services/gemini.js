require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function askGemini(message) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
    });

    return response.text;

  } catch (error) {

    console.error("===== GEMINI ERROR =====");
    console.error(error);

    if (error.error) {
      console.error("Google Error:");
      console.error(JSON.stringify(error.error, null, 2));
    }

    throw error;
  }
}

module.exports = askGemini;