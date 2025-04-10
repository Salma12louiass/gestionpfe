// server_minimal.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialisation de l'application Express
const app = express();
const port = 5000;

// Configuration des middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Route de test simple
app.get("/api/test", (req, res) => {
  res.json({ message: "Le serveur fonctionne correctement" });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;