const askGroq = require("../services/groq");

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Método no permitido"
    });
  }

  try {

  let message;

if (typeof req.body === "string") {

    try {
        const body = JSON.parse(req.body);
        message = body.message;
    } catch (e) {
        message = null;
    }

} else {

    // JSON normal
    message = req.body.message;

    // Android Builder (application/x-www-form-urlencoded)
    if (!message) {

        const keys = Object.keys(req.body);

        if (keys.length > 0) {

            try {

                const body = JSON.parse(keys[0]);
                message = body.message;

            } catch (e) {}

        }

    }

}

console.log("Content-Type:", req.headers["content-type"]);
console.log("Body recibido:", req.body);

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "No se recibió ningún mensaje."
      });
    }

    const response = await askGroq(message);

    return res.json({
      success: true,
      response
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }

};