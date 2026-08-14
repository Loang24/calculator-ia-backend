const { askAI } = require("../services/aiManager");

module.exports = async (req, res) => {

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Método no permitido"
        });
    }

    try {

        let message;
        let language = "es";

        if (typeof req.body === "string") {

            try {

                const body = JSON.parse(req.body);

                message = body.message;
                language = body.language || "es";

            } catch (e) {

                message = null;

            }

        } else {

            // JSON normal
            message = req.body.message;
            language = req.body.language || "es";

            // Android Builder (application/x-www-form-urlencoded)
            if (!message) {

                const keys = Object.keys(req.body);

                // ===== LOGS PARA DEPURACIÓN =====

                console.log("Keys:", keys);
                console.log("Primer Key:", keys[0]);

                // ================================

                if (keys.length > 0) {

                    try {

                        const body = JSON.parse(keys[0]);

                        message = body.message;
                        language = body.language || "es";

                    } catch (e) {

                        console.error(
                            "Error haciendo JSON.parse:",
                            e
                        );

                    }

                }

            }

        }

        console.log("Content-Type:", req.headers["content-type"]);
        console.log("Body recibido:", req.body);

        // Decodificar el texto recibido desde Android Builder

        try {

            message = decodeURIComponent(message);

        } catch (e) {

            console.log(
                "No fue necesario decodificar."
            );

        }

        // Limpiar el texto

        message = String(message)
            .replace(/\r/g, "")
            .replace(/\n/g, " ")
            .replace(/\t/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        // Limpiar código de idioma

        language = String(language || "es")
            .trim()
            .toLowerCase();

        console.log("Idioma recibido:", language);

        if (!message) {

            return res.status(400).json({
                success: false,
                error: "No se recibió ningún mensaje."
            });

        }

        // Enviar mensaje + idioma a la IA

        const response = await askAI(
            message,
            language
        );

        return res.json({
            success: true,
            response
        });

    } catch (error) {

        console.error("ERROR GENERAL:");
        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

};