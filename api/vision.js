const Busboy = require("busboy");

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
        console.log("Headers:", req.headers);
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
                console.log("Chunk recibido:", data.length, "bytes");
                chunks.push(data);
            });

            file.on("end", () => {

                imageBuffer = Buffer.concat(chunks);

                console.log("Archivo terminado.");
                console.log("Tamaño:", imageBuffer.length, "bytes");

            });

        });

        busboy.on("finish", async () => {

            console.log("Busboy terminó de procesar la petición.");

            if (!imageBuffer) {

                console.log("ERROR: No llegó ninguna imagen.");

                return res.status(400).json({
                    success: false,
                    error: "No se recibió ninguna imagen."
                });

            }

            console.log("Imagen lista para enviar a Gemini.");

            return res.json({
                success: true,
                message: "Imagen recibida correctamente.",
                size: imageBuffer.length,
                mimeType: mimeType
            });

        });

        req.pipe(busboy);

    } catch (error) {

        console.error("===== ERROR EN VISION =====");
        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

};