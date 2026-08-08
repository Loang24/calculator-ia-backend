const Busboy = require("busboy");

module.exports = async (req, res) => {

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Método no permitido"
        });
    }

    try {

        const busboy = Busboy({
            headers: req.headers
        });

        let imageBuffer = null;
        let mimeType = null;

        busboy.on("file", (fieldname, file, info) => {

            mimeType = info.mimeType;

            const chunks = [];

            file.on("data", (data) => {
                chunks.push(data);
            });

            file.on("end", () => {
                imageBuffer = Buffer.concat(chunks);
            });

        });

        busboy.on("finish", async () => {

            if (!imageBuffer) {

                return res.status(400).json({
                    success: false,
                    error: "No se recibió ninguna imagen."
                });

            }

            return res.json({
                success: true,
                message: "Imagen recibida correctamente.",
                size: imageBuffer.length,
                mimeType: mimeType
            });

        });

        req.pipe(busboy);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

};