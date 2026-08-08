const Busboy = require("busboy");
const { askAIVision } = require("../services/aiManager");

module.exports = async (req, res) => {

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Método no permitido"
        });
    }

    try {

        console.log("======================================");
        console.log("NUEVA PETICIÓN A /api/vision");
        console.log("Método:", req.method);
        console.log("======================================");

        const busboy = Busboy({
            headers: req.headers
        });

        let imageBuffer = null;
        let mimeType = null;

        busboy.on("file", (fieldname, file, info) => {

            console.log("Archivo recibido");
            console.log("Campo:", fieldname);
            console.log("Nombre:", info.filename);
            console.log("MimeType:", info.mimeType);

            mimeType = info.mimeType;

            const chunks = [];

            file.on("data", (data) => {

                console.log(
                    "Chunk recibido:",
                    data.length,
                    "bytes"
                );

                chunks.push(data);

            });

            file.on("end", () => {

                imageBuffer = Buffer.concat(chunks);

                console.log("Archivo terminado.");
                console.log(
                    "Tamaño:",
                    imageBuffer.length,
                    "bytes"
                );

            });

        });

        busboy.on("finish", async () => {

            console.log(
                "Busboy terminó de procesar la petición."
            );

            if (!imageBuffer) {

                console.log(
                    "ERROR: No llegó ninguna imagen."
                );

                return res.status(400).json({
                    success: false,
                    error: "No se recibió ninguna imagen."
                });

            }

            console.log(
                "Imagen recibida correctamente."
            );

            console.log(
                "Enviando imagen a Gemini Vision..."
            );

            try {

                const response = await askAIVision(
                    imageBuffer,
                    mimeType
                );

                console.log(
                    "Gemini Vision respondió correctamente."
                );

                console.log(
                    "Longitud de respuesta:",
                    response ? response.length : 0
                );

                // =====================================================
                // RESPUESTA LIMPIA PARA ANDROID BUILDER
                // =====================================================

                return res
                    .status(200)
                    .type("text/plain")
                    .send(response);

            } catch (error) {

                console.error(
                    "===== ERROR GEMINI VISION ====="
                );

                console.error(error);

                return res.status(500).json({
                    success: false,
                    error: error.message
                });

            }

        });

        req.pipe(busboy);

    } catch (error) {

        console.error(
            "===== ERROR EN /api/vision ====="
        );

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

};