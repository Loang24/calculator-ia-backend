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

async function askAI(message, language) {

    if (AI_PROVIDER === "gemini") {

        console.log("🤖 USANDO GEMINI");
        console.log("🌍 IDIOMA:", language);

        return await askGemini(
            message,
            language
        );
    }

    console.log("🤖 USANDO GROQ");

    return await askGroq(message);
}


// ============================================================
// GEMINI - VISIÓN
// ============================================================

async function askAIVision(
    imageBuffer,
    mimeType,
    language
) {

    if (AI_PROVIDER === "gemini") {

        console.log("👁️ USANDO GEMINI VISION");
        console.log("🌍 IDIOMA:", language);

        return await askGeminiVision(
            imageBuffer,
            mimeType,
            language
        );
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