require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});


// ============================================================
// CONFIGURACIÓN DE REINTENTOS
// ============================================================

const MAX_RETRIES = 3;

const RETRYABLE_STATUS = [
    429,
    500,
    502,
    503,
    504
];


// ============================================================
// FUNCIÓN PARA ESPERAR
// ============================================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// ============================================================
// MOSTRAR ERROR COMPLETO DE GEMINI
// ============================================================

function logGeminiError(error) {

    console.error("========================================");
    console.error("      DETALLE COMPLETO DEL ERROR");
    console.error("========================================");

    console.error("Mensaje:");
    console.error(error?.message);

    console.error("Status:");
    console.error(error?.status);

    console.error("Nombre:");
    console.error(error?.name);

    console.error("Error interno:");
    console.error(error?.error);

    console.error("Detalles:");
    console.error(error?.details);

    console.error("Response:");
    console.error(error?.response);

    console.error("Código:");
    console.error(error?.code);

    console.error("Objeto completo:");

    try {

        console.error(
            JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
        );

    } catch (jsonError) {

        console.error(
            "No fue posible convertir el error a JSON."
        );

        console.error(error);
    }

    console.error("========================================");
}


// ============================================================
// EJECUTAR GEMINI CON REINTENTOS
// ============================================================

async function generateWithRetry(request) {

    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

        try {

            console.log(
                `🤖 Gemini intento ${attempt}/${MAX_RETRIES}`
            );

            const response =
                await ai.models.generateContent(request);

            console.log(
                "✅ Gemini respondió correctamente."
            );

            return response;

        } catch (error) {

            lastError = error;

            const status =
                error?.status ||
                error?.error?.code ||
                error?.error?.status;

            console.error(
                `❌ Gemini error en intento ${attempt}: ${status || "DESCONOCIDO"}`
            );

            // Mostrar información detallada
            logGeminiError(error);

            // Si no es un error temporal,
            // no hacemos más reintentos.

            if (!RETRYABLE_STATUS.includes(Number(status))) {

                throw error;
            }

            // Último intento

            if (attempt === MAX_RETRIES) {

                console.error(
                    "❌ Gemini continúa sin responder después de varios intentos."
                );

                throw error;
            }

            // Espera progresiva:
            //
            // intento 1 → 2 segundos
            // intento 2 → 4 segundos

            const delay =
                2000 * Math.pow(2, attempt - 1);

            console.log(
                `⏳ Esperando ${delay / 1000} segundos antes de reintentar...`
            );

            await sleep(delay);
        }
    }

    throw lastError;
}


// ============================================================
// GEMINI PARA TEXTO
// ============================================================

async function askGemini(message) {

    try {

        const response =
            await generateWithRetry({

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
2. Sé breve, directo y específico.
3. No repitas innecesariamente la pregunta del usuario.
4. No hagas introducciones largas.
5. En problemas matemáticos muestra solamente los pasos necesarios.
6. Si el usuario solo quiere el resultado, entrega solamente el resultado.
7. Si el usuario pide una explicación, explica de forma clara pero breve.
8. Si el usuario saluda, responde de forma amable y natural.
9. No agregues información que el usuario no haya solicitado.
10. Si no sabes una respuesta, dilo con honestidad y no inventes información.
11. Mantén siempre un tono profesional, claro y amigable.
12. Prioriza respuestas cortas, pero siempre completas.
13. Nunca cortes una palabra, frase, oración, operación o explicación.
14. Completa siempre la respuesta antes de terminar.
15. Para preguntas sencillas, responde normalmente en 1 o 2 frases.
16. Para problemas matemáticos, utiliza solamente los pasos indispensables.
17. Evita explicaciones repetitivas o innecesarias.

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
- NO uses código Markdown.

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
                ]

            });

        return response.text;

    } catch (error) {

        console.error("===== GEMINI ERROR =====");

        logGeminiError(error);

        throw error;
    }
}


// ============================================================
// GEMINI VISION - ANALIZAR IMÁGENES
// ============================================================

async function askGeminiVision(
    imageBuffer,
    mimeType
) {

    try {

        // Convertir imagen a Base64

        const base64Image =
            imageBuffer.toString("base64");


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
4. Si la imagen contiene un ejercicio matemático, identifica exactamente los datos necesarios.
5. Si hay varias preguntas, identifica cada una por separado.
6. Resuelve correctamente el problema.
7. Comprueba los cálculos antes de entregar la respuesta.
8. Si existe información visual importante para resolver el problema, utilízala.
9. Si algún elemento importante de la imagen no es legible, indícalo claramente en lugar de inventarlo.
10. Responde siempre en español.
11. Sé breve, directo y específico.
12. No repitas todo el texto de la imagen.
13. No hagas introducciones innecesarias.
14. Muestra solamente los pasos indispensables.
15. Prioriza respuestas cortas, pero siempre completas.
16. Nunca cortes una palabra, frase, operación o explicación.
17. Completa siempre la respuesta antes de terminar.
18. Evita explicaciones largas o repetitivas.
19. Para ejercicios sencillos utiliza pocos pasos.
20. Para ejercicios complejos utiliza únicamente los pasos necesarios.
21. No inventes datos que no aparezcan en la imagen.


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

Utiliza títulos simples en MAYÚSCULAS solamente cuando sean necesarios:

DATOS:

RESOLUCIÓN:

COMPROBACIÓN:

RESPUESTA:

No utilices todos los títulos si no son necesarios.

La respuesta debe ser completamente legible como texto plano dentro de Android Builder.


============================================================
ANÁLISIS DE LA IMAGEN
============================================================

Analiza ahora la imagen proporcionada.

Identifica los datos necesarios.

Resuelve el problema.

Comprueba el resultado.

Responde de forma breve, clara y completa.

Finalmente proporciona:

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
        // ENVIAR A GEMINI CON REINTENTOS
        // ====================================================

        console.log(
            "👁️ USANDO GEMINI VISION"
        );

        console.log(
            "MimeType:",
            mimeType
        );

        console.log(
            "Tamaño de imagen:",
            imageBuffer.length,
            "bytes"
        );


        const response =
            await generateWithRetry({

                model: "gemini-3.5-flash",

                contents: contents

            });


        // ====================================================
        // DEVOLVER RESPUESTA
        // ====================================================

        return response.text;

    } catch (error) {

        console.error(
            "===== GEMINI VISION ERROR ====="
        );

        logGeminiError(error);

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