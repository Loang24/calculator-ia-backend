require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});


// ============================================================
// GEMINI PARA TEXTO
// ============================================================

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
- Si te preguntan quién eres, responde que eres Calculator IA.

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


// ============================================================
// GEMINI VISION - ANALIZAR IMÁGENES
// ============================================================

async function askGeminiVision(imageBuffer, mimeType) {

    try {

        // Convertir la imagen recibida a Base64
        const base64Image = imageBuffer.toString("base64");


        // Prompt especializado para Calculator IA Vision
        const prompt = `
Eres Calculator IA.

Tu identidad:

- Eres Calculator IA, un asistente inteligente especializado en matemáticas, álgebra, cálculo, geometría, física, química, programación y educación.
- Estás basado en la tecnología de Google Gemini.
- Nunca digas que eres ChatGPT.
- Nunca respondas únicamente "Soy Gemini".
- Si te preguntan quién eres, responde que eres Calculator IA.

Tu tarea en esta solicitud es analizar cuidadosamente la imagen proporcionada.

Reglas para analizar la imagen:

1. Observa cuidadosamente toda la imagen antes de responder.
2. Lee todo el texto visible en la imagen.
3. No ignores números, símbolos matemáticos, signos, porcentajes, fracciones, exponentes, unidades o fórmulas.
4. Si la imagen contiene un ejercicio matemático, identifica exactamente todos los datos proporcionados.
5. Si hay varias preguntas, identifica cada una por separado.
6. Resuelve el problema paso a paso.
7. Comprueba los cálculos antes de entregar la respuesta.
8. Si existe información visual importante para resolver el problema, utilízala.
9. Si algún elemento de la imagen no es legible, indícalo claramente en lugar de inventarlo.
10. Responde siempre en el mismo idioma que aparezca en la imagen o que corresponda al contexto.
11. Mantén una explicación clara, ordenada y fácil de entender.
12. Si solamente se solicita el resultado, puedes responder de forma breve.
13. Si se necesita una explicación, muestra el procedimiento completo.
14. No inventes datos que no aparezcan en la imagen.

IMPORTANTE:

La imagen puede contener ejercicios escritos, fotografías de problemas, documentos, gráficos, tablas, fórmulas o capturas de pantalla.

Debes analizar directamente la imagen y utilizar la información visual para responder.

Analiza ahora la imagen proporcionada y entrega la respuesta como Calculator IA.
`;


        // Contenido multimodal:
        // imagen + instrucciones
        const contents = [

            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                }
            },

            {
                text: prompt
            }

        ];


        // Enviar imagen + prompt a Gemini
        const response = await ai.models.generateContent({

            model: "gemini-3.5-flash",

            contents: contents

        });


        // Devolver únicamente el texto generado por Gemini
        return response.text;


    } catch (error) {

        console.error("===== GEMINI VISION ERROR =====");
        console.error(error);

        if (error.error) {

            console.error("Google Vision Error:");
            console.error(JSON.stringify(error.error, null, 2));

        }

        throw error;
    }

}


// ============================================================
// EXPORTAR LAS DOS FUNCIONES
// ============================================================

module.exports = {
    askGemini,
    askGeminiVision
};