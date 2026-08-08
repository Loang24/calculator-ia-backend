const askGroq = require("./groq");
const { askGemini, askGeminiVision } = require("./gemini");


// ============================================================
// CONFIGURACIÓN DEL PROVEEDOR DE IA
// ============================================================

const AI_PROVIDER = "gemini";
// const AI_PROVIDER = "groq";


// ============================================================
// GEMINI - TEXTO
// ============================================================

async function askAI(message) {

    if (AI_PROVIDER === "gemini") {

        console.log("🤖 USANDO GEMINI");

        return await askGemini(message);

    }

    console.log("🤖 USANDO GROQ");

    return await askGroq(message);
}


// ============================================================
// GEMINI - VISIÓN
// ============================================================

async function askAIVision(imageBuffer, mimeType) {

    if (AI_PROVIDER === "gemini") {

        console.log("👁️ USANDO GEMINI VISION");

        return await askGeminiVision(imageBuffer, mimeType);

    }

    throw new Error(
        "La función Vision actualmente solo está configurada para Gemini."
    );
}


// ============================================================
// EXPORTAR FUNCIONES
// ============================================================

module.exports = {
    askAI,
    askAIVision
};