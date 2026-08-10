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
2. Sé muy breve, directo y específico.
3. No repitas innecesariamente la pregunta del usuario.
4. No hagas introducciones largas.
5. En problemas matemáticos muestra únicamente los pasos necesarios para llegar al resultado.
6. Si el usuario solo quiere el resultado, entrega solamente el resultado.
7. Si el usuario pide una explicación, explica de forma breve y clara.
8. Si el usuario saluda, responde de forma amable y natural en una sola frase.
9. No agregues información que el usuario no haya solicitado.
10. Si no sabes una respuesta, dilo con honestidad y no inventes información.
11. Mantén siempre un tono profesional, claro y amigable.
12. Intenta mantener las respuestas en un máximo de 8 líneas.
13. Evita explicaciones largas o repetitivas.

FORMATO:

Para problemas matemáticos utiliza:

DATOS:
Solo los datos necesarios.

RESOLUCIÓN:
Solo las operaciones y pasos indispensables.

RESPUESTA:
Resultado final.

IMPORTANTE:

La respuesta será mostrada directamente en un componente de texto plano de Android Builder.

Por lo tanto:

- NO uses Markdown.
- NO uses títulos con ###.
- NO uses asteriscos.
- NO uses símbolos $.
- NO uses LaTeX.
- NO uses comandos LaTeX.
- NO uses bloques $$.

Para matemáticas utiliza texto normal y símbolos Unicode:

× multiplicación
÷ división
− resta
+ suma
= igualdad
% porcentajes
√ raíces

La respuesta debe ser completamente legible como texto plano.

Pregunta del usuario:

${message}
`
                        }
                    ]
                }
            ],

            config: {
                maxOutputTokens: 350
            }

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

1. Observa cuidadosamente la imagen antes de responder.
2. Lee los datos importantes de la imagen.
3. No ignores números, símbolos, porcentajes, fracciones, exponentes, unidades o fórmulas necesarias para resolver el problema.
4. Si contiene un ejercicio matemático, identifica solamente los datos necesarios.
5. Si hay varias preguntas, responde cada una de forma breve.
6. Resuelve correctamente el problema.
7. Comprueba mentalmente los cálculos antes de responder.
8. Si algún elemento importante no es legible, indícalo claramente.
9. No inventes datos.
10. Responde en español.
11. Sé breve, directo y específico.
12. No repitas todo el texto de la imagen.
13. No hagas introducciones innecesarias.
14. Muestra solamente los pasos indispensables.
15. Intenta mantener la respuesta en un máximo de 10 líneas.


============================================================
FORMATO DE RESPUESTA
============================================================

IMPORTANTE:

La respuesta será mostrada directamente en un componente de texto plano de Android Builder.

Por lo tanto:

- NO uses Markdown.
- NO uses títulos con ###.
- NO uses asteriscos.
- NO uses símbolos $.
- NO uses LaTeX.
- NO uses comandos LaTeX.
- NO uses bloques $$.
- NO uses código Markdown.

Para matemáticas utiliza texto normal y símbolos Unicode:

× para multiplicación
÷ para división
− para resta
+ para suma
= para igualdad
% para porcentajes
√ para raíces

Utiliza solamente estos títulos cuando sean necesarios:

DATOS:

RESOLUCIÓN:

RESPUESTA:

No utilices todos los títulos si no son necesarios.

La respuesta debe ser completamente legible como texto plano dentro de Android Builder.


============================================================
ANÁLISIS DE LA IMAGEN
============================================================

Analiza la imagen.

Identifica los datos necesarios.

Resuelve el problema.

Comprueba el resultado.

Responde de forma breve y termina con:

RESPUESTA:

seguido del resultado final.
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

            contents: contents,

            config: {
                maxOutputTokens: 350
            }

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