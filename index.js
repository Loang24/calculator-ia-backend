const express = require("express");
const cors = require("cors");
require("dotenv").config();
console.log("Groq Key:", process.env.GROQ_API_KEY ? "Cargada ✅" : "No encontrada ❌");
const app = express();

// Configuración
app.use(cors());
app.use(express.json());
app.use(express.text());

// Ruta principal
app.get("/", (req, res) => {
    res.json({
        status: "online",
        project: "Calculator IA Backend",
        version: "1.0.0"
    });
});
// Ruta del chat
const chatRoute = require("./api/chat");

app.use("/api/chat", chatRoute);
// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en el puerto ${PORT}`);
});