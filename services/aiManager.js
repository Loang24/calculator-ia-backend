const askGroq = require("./groq");
const askGemini = require("./gemini");

// Cambia aquí la IA que quieres usar
const AI_PROVIDER = "gemini";
// const AI_PROVIDER = "groq";

async function askAI(message) {

    if (AI_PROVIDER === "gemini") {
        console.log("🚀 USANDO GEMINI");
        return await askGemini(message);
    }

    console.log("🤖 USANDO GROQ");
    return await askGroq(message);

}

module.exports = askAI;