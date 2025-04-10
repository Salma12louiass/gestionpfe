// server_essential.js
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Initialisation de l'application Express
const app = express();
const port = 5000;

// Configuration des middlewares
app.use(cors({ origin: "http://localhost:3000", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(bodyParser.json());
app.use(express.json());

// Vérifier si le dossier "uploads" existe, sinon le créer
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connexion à la base de données
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Ajoutez votre mot de passe MySQL ici si nécessaire
  database: "gestionpfe",
});

db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données:", err);
    return;
  }
  console.log("Connecté à la base de données");
});

// Route d'authentification
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  // Rechercher l'utilisateur par email
  const query = "SELECT * FROM Login WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Erreur de connexion à la base de données:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const user = results[0];

    // Vérifier le mot de passe
    if (password !== user.password) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // En cas de succès, renvoyer les informations de l'utilisateur
    res.json({ 
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role
      }
    });
  });
});

// Récupérer tous les livrables
app.get("/api/livrables", (req, res) => {
  const query = "SELECT * FROM Livrable";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des livrables:", err);
      return res.status(500).json({ error: "Échec de la récupération des livrables" });
    }
    res.status(200).json(results);
  });
});

// Récupérer tous les utilisateurs
app.get('/api/users', (req, res) => {
  const query = `
    (SELECT idEtudiant as id, nom, prenom, email, 'etudiant' as type FROM Etudiant)
    UNION
    (SELECT idTuteur as id, nom, prenom, email, 'tuteur' as type FROM Tuteur)
    UNION
    (SELECT idEncadrant as id, nom, prenom, email, 'encadrant' as type FROM Encadrant)
    UNION
    (SELECT idResponsableFiliere as id, nom, prenom, email, 'responsable' as type FROM ResponsableFiliere)
    ORDER BY type, nom
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    res.json(results);
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;