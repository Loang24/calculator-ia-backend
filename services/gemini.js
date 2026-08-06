require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function askGemini(message) {

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: message,
    });

    return response.text;

}

module.exports = askGemini;