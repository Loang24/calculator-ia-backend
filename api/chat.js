const express = require("express");
const router = express.Router();

const askGroq = require("../services/groq");

console.log("askGroq:", askGroq);
console.log("Tipo:", typeof askGroq);

router.post("/", async (req, res) => {

    try {

        const { message } = req.body;

        if (!message) {

            return res.status(400).json({
                success: false,
                error: "No se recibió ningún mensaje."
            });

        }

        const response = await askGroq(message);

        res.json({

            success: true,
            response

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,
            error: error.message

        });

    }

});

module.exports = router;