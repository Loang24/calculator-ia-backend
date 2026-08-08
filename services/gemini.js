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


        // ====================================================
        // PROMPT PARA CALCULATOR IA VISION
        // ====================================================

        const prompt = `
Eres Calculator IA.

Tu identidad:

- Eres Calculator IA, un asistente inteligente especializado en matemáticas, álgebra, cálculo, geometría, física, química, programación y educación.
- Estás basado en la tecnología de Google Gemini.
- Nunca digas que eres ChatGPT.
- Nunca respondas únicamente "Soy Gemini".
- Si te preguntan quién eres, responde que eres Calculator IA.

Tu tarea es analizar cuidadosamente la imagen proporcionada.

REGLAS PARA ANALIZAR LA IMAGEN:

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


============================================================
FORMATO DE RESPUESTA
============================================================

IMPORTANTE:

La respuesta será mostrada directamente en un componente de texto plano de Android Builder.

Por lo tanto:

- NO uses Markdown.
- NO uses títulos con ###.
- NO uses asteriscos para negritas.
- NO uses símbolos $ para fórmulas.
- NO uses LaTeX.
- NO uses comandos LaTeX de ningún tipo.
- NO uses bloques de fórmulas con $$.
- NO uses código Markdown.
- NO utilices formatos especiales que dependan de un renderizador.

Para matemáticas utiliza texto normal y símbolos Unicode cuando sea posible.

Utiliza:

× para multiplicación
÷ para división
− para resta
+ para suma
= para igualdad
% para porcentajes
√ para raíces

Utiliza títulos simples en MAYÚSCULAS:

ANÁLISIS:

RESOLUCIÓN:

COMPROBACIÓN:

RESPUESTA:


EJEMPLO:

En lugar de escribir una fórmula con formato especial como:

0.90 por T menos 0.85 por T igual a 1

puedes escribir:

0.90 × T − 0.85 × T = 1

En lugar de utilizar una fracción con formato especial, escribe:

T = 1 ÷ 0.05

Y después:

T = 20


IMPORTANTE:

No utilices caracteres de Markdown ni LaTeX.

La respuesta debe ser completamente legible como texto plano dentro de Android Builder.


============================================================
ANÁLISIS DE LA IMAGEN
============================================================

Analiza ahora la imagen proporcionada.

Identifica todos los datos importantes.

Resuelve el problema paso a paso.

Comprueba el resultado.

Finalmente proporciona una sección:

RESPUESTA:

con el resultado final de forma clara.
`;


        // ====================================================
        // CONTENIDO MULTIMODAL
        // IMAGEN + PROMPT
        // ====================================================

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


        // ====================================================
        // ENVIAR A GEMINI
        // ====================================================

        const response = await ai.models.generateContent({

            model: "gemini-3.5-flash",

            contents: contents

        });


        // ====================================================
        // DEVOLVER RESPUESTA
        // ====================================================

        return response.text;


    } catch (error) {

        console.error("===== GEMINI VISION ERROR =====");
        console.error(error);

        if (error.error) {

            console.error("Google Vision Error:");
            console.error(
                JSON.stringify(error.error, null, 2)
            );

        }

        throw error;
    }

}


// ============================================================
// EXPORTAR FUNCIONES
// ============================================================

module.exports = {
    askGemini,
    askGeminiVision
};