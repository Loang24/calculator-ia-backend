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
            JSON.stringify(
                error,
                Object.getOwnPropertyNames(error),
                2
            )
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

    for (
        let attempt = 1;
        attempt <= MAX_RETRIES;
        attempt++
    ) {

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

            logGeminiError(error);

            if (
                !RETRYABLE_STATUS.includes(
                    Number(status)
                )
            ) {

                throw error;
            }

            if (attempt === MAX_RETRIES) {

                console.error(
                    "❌ Gemini continúa sin responder después de varios intentos."
                );

                throw error;
            }

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
// IDIOMA DE RESPUESTA
// ============================================================

function normalizeLanguage(language) {

    let code = String(language || "es")
        .trim()
        .toLowerCase();

    // Convertir formatos como:
    // en-rGB → en
    // en-US → en
    // es-CO → es
    // pt-BR → pt
    // zh-CN → zh

    code = code.replace("_", "-");

    if (code.includes("-")) {
        code = code.split("-")[0];
    }

    return code;
}


// ============================================================
// INSTRUCCIÓN DE IDIOMA PARA GEMINI
// ============================================================

function getLanguageInstruction(language) {

    const code = normalizeLanguage(language);

    const instructions = {

        af: "Responde exclusivamente en afrikáans.",
        sq: "Responde exclusivamente en albanés.",
        am: "Responde exclusivamente en amhárico.",
        ar: "Responde exclusivamente en árabe.",
        hy: "Responde exclusivamente en armenio.",
        as: "Responde exclusivamente en asamés.",
        az: "Responde exclusivamente en azerí.",
        eu: "Responde exclusivamente en euskera.",
        be: "Responde exclusivamente en bielorruso.",
        bn: "Responde exclusivamente en bengalí.",
        nb: "Responde exclusivamente en noruego bokmål.",
        bs: "Responde exclusivamente en bosnio.",
        bg: "Responde exclusivamente en búlgaro.",
        my: "Responde exclusivamente en birmano.",
        ca: "Responde exclusivamente en catalán.",
        km: "Responde exclusivamente en jemer.",
        zh: "Responde exclusivamente en chino.",
        hr: "Responde exclusivamente en croata.",
        da: "Responde exclusivamente en danés.",
        nl: "Responde exclusivamente en neerlandés.",
        en: "Responde exclusivamente en inglés.",
        et: "Responde exclusivamente en estonio.",
        fi: "Responde exclusivamente en finés.",
        fr: "Responde exclusivamente en francés.",
        gl: "Responde exclusivamente en gallego.",
        ka: "Responde exclusivamente en georgiano.",
        de: "Responde exclusivamente en alemán.",
        el: "Responde exclusivamente en griego.",
        gu: "Responde exclusivamente en guyaratí.",
        iw: "Responde exclusivamente en hebreo.",
        hi: "Responde exclusivamente en hindi.",
        hu: "Responde exclusivamente en húngaro.",
        is: "Responde exclusivamente en islandés.",
        in: "Responde exclusivamente en indonesio.",
        it: "Responde exclusivamente en italiano.",
        ja: "Responde exclusivamente en japonés.",
        kn: "Responde exclusivamente en canarés.",
        kk: "Responde exclusivamente en kazajo.",
        ky: "Responde exclusivamente en kirguís.",
        ko: "Responde exclusivamente en coreano.",
        lo: "Responde exclusivamente en lao.",
        lv: "Responde exclusivamente en letón.",
        lt: "Responde exclusivamente en lituano.",
        mk: "Responde exclusivamente en macedonio.",
        ms: "Responde exclusivamente en malayo.",
        ml: "Responde exclusivamente en malayalam.",
        mr: "Responde exclusivamente en maratí.",
        mn: "Responde exclusivamente en mongol.",
        ne: "Responde exclusivamente en nepalí.",
        no: "Responde exclusivamente en noruego.",
        or: "Responde exclusivamente en odia.",
        pa: "Responde exclusivamente en panyabí.",
        fa: "Responde exclusivamente en persa.",
        pl: "Responde exclusivamente en polaco.",
        pt: "Responde exclusivamente en portugués.",
        ro: "Responde exclusivamente en rumano.",
        ru: "Responde exclusivamente en ruso.",
        sr: "Responde exclusivamente en serbio.",
        si: "Responde exclusivamente en cingalés.",
        sk: "Responde exclusivamente en eslovaco.",
        sl: "Responde exclusivamente en esloveno.",
        es: "Responde exclusivamente en español.",
        sw: "Responde exclusivamente en suajili.",
        sv: "Responde exclusivamente en sueco.",
        tl: "Responde exclusivamente en tagalo.",
        ta: "Responde exclusivamente en tamil.",
        te: "Responde exclusivamente en telugu.",
        th: "Responde exclusivamente en tailandés.",
        tr: "Responde exclusivamente en turco.",
        uk: "Responde exclusivamente en ucraniano.",
        ur: "Responde exclusivamente en urdu.",
        uz: "Responde exclusivamente en uzbeko.",
        vi: "Responde exclusivamente en vietnamita.",
        zu: "Responde exclusivamente en zulú."
    };

    return instructions[code] ||
        "Responde exclusivamente en español.";
}


// ============================================================
// GEMINI PARA TEXTO
// ============================================================

async function askGemini(
    message,
    language
) {

    try {

        const normalizedLanguage =
            normalizeLanguage(language);

        const languageInstruction =
            getLanguageInstruction(
                normalizedLanguage
            );

        console.log(
            "🌍 Idioma recibido por Gemini:",
            language
        );

        console.log(
            "🌍 Idioma normalizado:",
            normalizedLanguage
        );

        console.log(
            "🗣️ Instrucción:",
            languageInstruction
        );


        const response =
            await generateWithRetry({

                model: "gemini-3.5-flash-lite",

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


============================================================
IDIOMA DE RESPUESTA
============================================================

${languageInstruction}

El código de idioma seleccionado por la aplicación es:

${normalizedLanguage}

IMPORTANTE:

- Debes responder exclusivamente en el idioma indicado anteriormente.
- El idioma del dispositivo tiene prioridad sobre el idioma en el que escriba el usuario.
- Si el usuario escribe en otro idioma, debes responder igualmente en el idioma indicado por la aplicación.
- No cambies de idioma automáticamente.
- No respondas en español si el idioma seleccionado es diferente.
- Mantén los nombres de operaciones matemáticas y símbolos de forma comprensible para el idioma seleccionado.


============================================================
REGLAS
============================================================

1. Responde utilizando exclusivamente el idioma indicado por la aplicación.
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


============================================================
FORMATO
============================================================

Para problemas matemáticos utiliza:

DATOS:

Solo los datos necesarios.

RESOLUCIÓN:

Solo las operaciones y pasos indispensables.

RESPUESTA:

Resultado final.


============================================================
IMPORTANTE
============================================================

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


============================================================
PREGUNTA DEL USUARIO
============================================================

${message}

`

                            }

                        ]

                    }

                ]

            });


        return response.text;

    } catch (error) {

        console.error(
            "===== GEMINI ERROR ====="
        );

        logGeminiError(error);

        throw error;
    }
}


// ============================================================
// GEMINI VISION - ANALIZAR IMÁGENES
// ============================================================

async function askGeminiVision(
    imageBuffer,
    mimeType,
    language
) {

    try {

        // ========================================================
        // IDIOMA
        // ========================================================

        const normalizedLanguage =
            normalizeLanguage(language);

        const languageInstruction =
            getLanguageInstruction(
                normalizedLanguage
            );

        console.log(
            "🌍 Idioma recibido por Gemini Vision:",
            language
        );

        console.log(
            "🌍 Idioma normalizado Vision:",
            normalizedLanguage
        );

        console.log(
            "🗣️ Instrucción Vision:",
            languageInstruction
        );


        // ========================================================
        // CONVERTIR IMAGEN A BASE64
        // ========================================================

        const base64Image =
            imageBuffer.toString("base64");


        // ========================================================
        // PROMPT PARA CALCULATOR IA VISION
        // ========================================================

        const prompt = `

Eres Calculator IA.

Tu identidad:

- Eres Calculator IA, un asistente inteligente especializado en matemáticas, álgebra, cálculo, geometría, física, química, programación y educación.
- Estás basado en la tecnología de Google Gemini.
- Nunca digas que eres ChatGPT.
- Nunca respondas únicamente "Soy Gemini".
- Si te preguntan quién eres, responde que eres Calculator IA.


============================================================
IDIOMA DE RESPUESTA
============================================================

${languageInstruction}

El código de idioma seleccionado por la aplicación es:

${normalizedLanguage}

IMPORTANTE:

- Debes responder exclusivamente en el idioma indicado por la aplicación.
- El idioma del dispositivo tiene prioridad sobre el idioma que aparezca escrito en la imagen.
- Si el texto de la imagen está en otro idioma, debes analizarlo normalmente pero responder en el idioma indicado por la aplicación.
- No cambies de idioma automáticamente.
- No respondas en español si el idioma seleccionado es diferente.


============================================================
TAREA
============================================================

Tu tarea es analizar cuidadosamente la imagen proporcionada.


============================================================
REGLAS PARA ANALIZAR LA IMAGEN
============================================================

1. Observa cuidadosamente toda la imagen antes de responder.
2. Lee todo el texto visible en la imagen.
3. No ignores números, símbolos matemáticos, signos, porcentajes, fracciones, exponentes, unidades o fórmulas.
4. Si la imagen contiene un ejercicio matemático, identifica exactamente los datos necesarios.
5. Si hay varias preguntas, identifica cada una por separado.
6. Resuelve correctamente el problema.
7. Comprueba los cálculos antes de entregar la respuesta.
8. Si existe información visual importante para resolver el problema, utilízala.
9. Si algún elemento importante de la imagen no es legible, indícalo claramente en lugar de inventarlo.
10. Responde exclusivamente en el idioma indicado por la aplicación.
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


Los títulos y etiquetas de la respuesta también deben estar completamente traducidos al idioma seleccionado.

No utilices títulos o etiquetas en español cuando el idioma seleccionado sea diferente del español.

Si utilizas secciones como DATOS, RESOLUCIÓN, COMPROBACIÓN o RESPUESTA, escríbelas en el idioma seleccionado.

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


        // ========================================================
        // CONTENIDO MULTIMODAL
        // IMAGEN + PROMPT
        // ========================================================

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


        // ========================================================
        // ENVIAR A GEMINI CON REINTENTOS
        // ========================================================

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

                model: "gemini-3.5-flash-lite",

                contents: contents

            });


        // ========================================================
        // DEVOLVER RESPUESTA
        // ========================================================

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