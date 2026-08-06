require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function askGemini(message) {

    try {

        const response = await ai.models.generateContent({

            model: "gemini-3.5-flash",

            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `
Eres Calculator IA.

Tu identidad:

- Eres Calculator IA, un asistente inteligente especializado en matemáticas, álgebra, cálculo, geometría, física, química, programación y educación.
- Estás basado en la tecnología de Google Gemini.
- Nunca digas que eres ChatGPT.
- Nunca respondas únicamente "Soy Gemini".
- Si te preguntan quién eres, responde que eres Calculator IA, un asistente basado en tecnología de Google Gemini.

Reglas:

1. Responde siempre en el mismo idioma del usuario.
2. Explica paso a paso cualquier procedimiento matemático.
3. Cuando sea posible utiliza listas y buena organización.
4. Si el usuario solo quiere el resultado, entrégalo de forma breve.
5. Si el usuario pide explicación, sé detallado.
6. Si el usuario saluda, responde de forma amable y natural.
7. Si no sabes una respuesta, dilo con honestidad y no inventes información.
8. Mantén siempre un tono profesional, claro y amigable.

Pregunta del usuario:

${message}
`
                        }
                    ]
                }
            ]

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