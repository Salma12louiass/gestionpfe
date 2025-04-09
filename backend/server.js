//MON-PROJET/backend/server.js
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");



const app = express();
const port = 5000;

// Configuration de multer pour les uploads de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF, images et documents sont autorisés'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// Vérifie si le dossier "uploads" existe, sinon le crée
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors({ origin: "http://localhost:3000", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(bodyParser.json());
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


// Récupérer tous les livrables
app.get("/api/livrables", (req, res) => {
  const query = `
    SELECT idLivrable, titre, contenu, version, statut, 
           DATE_FORMAT(dateSoumission, '%Y-%m-%d') AS dateSoumission, 
           type, idPfe, idEtudiant, fichierUrl, commentaires 
    FROM Livrable;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des livrables:", err);
      return res.status(500).json({ error: "Échec de la récupération des livrables" });
    }
    res.status(200).json(results);
  });
});

// Soumettre un nouveau livrable
app.post("/api/livrables", upload.single("file"), (req, res) => {
  const { titre, contenu, version, type, idPfe, idEtudiant } = req.body;
  const fichierUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!titre || !contenu || !type || !fichierUrl) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  const query = `
    INSERT INTO Livrable (titre, contenu, version, statut, dateSoumission, type, idPfe, idEtudiant, fichierUrl)
    VALUES (?, ?, ?, 'Soumis', CURDATE(), ?, ?, ?, ?);
  `;

  db.query(
    query,
    [titre, contenu, version, type, idPfe, idEtudiant, fichierUrl],
    (err, results) => {
      if (err) {
        console.error("Erreur lors de l'insertion du livrable:", err);
        return res.status(500).json({ error: "Échec de l'insertion du livrable" });
      }
      res.status(201).json({ message: "Livrable soumis avec succès", id: results.insertId });
    }
  );
});

// Mettre à jour un livrable
app.put("/api/livrables/:idLivrable", upload.single("file"), (req, res) => {
  const { idLivrable } = req.params;
  const { titre, contenu, type, statut } = req.body;
  const fichierUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // Valider l'ID
  if (!Number.isInteger(Number(idLivrable))) {
    return res.status(400).json({ error: "ID du livrable invalide" });
  }

  // Vérifier si le livrable existe
  const checkQuery = "SELECT * FROM Livrable WHERE idLivrable = ?";
  db.query(checkQuery, [idLivrable], (err, results) => {
    if (err) {
      console.error("Erreur SQL lors de la vérification du livrable:", err);
      return res.status(500).json({ error: "Erreur serveur lors de la vérification du livrable", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Livrable non trouvé" });
    }

    const currentLivrable = results[0];
    
    // Empêcher la modification si le livrable est déjà validé
    if (currentLivrable.statut === "Validé") {
      return res.status(400).json({ error: "Impossible de modifier un livrable déjà validé" });
    }

    let newVersion = currentLivrable.version;
    
    // If the livrable was rejected and is being updated, increment the version
    if (currentLivrable.statut === "Rejeté") {
      newVersion = currentLivrable.version + 1;
    }

    // Mettre à jour le livrable
    const updateQuery = `
      UPDATE Livrable
      SET titre = ?, contenu = ?, type = ?, statut = 'Soumis', fichierUrl = ?, version = ?
      WHERE idLivrable = ?;
    `;

    const values = [
      titre || currentLivrable.titre,
      contenu || currentLivrable.contenu,
      type || currentLivrable.type,
      fichierUrl || currentLivrable.fichierUrl,
      newVersion,
      idLivrable,
    ];

    db.query(updateQuery, values, (err, results) => {
      if (err) {
        console.error("Erreur SQL lors de la mise à jour du livrable:", err);
        return res.status(500).json({ error: "Erreur serveur lors de la mise à jour du livrable", details: err.message });
      }

      res.status(200).json({ 
        message: "Livrable mis à jour avec succès",
        newVersion: newVersion
      });
    });
  });
});

// Supprimer un livrable
app.delete("/api/livrables/:idLivrable", (req, res) => {
  const { idLivrable } = req.params;

  // Valider l'ID
  if (!Number.isInteger(Number(idLivrable))) {
    return res.status(400).json({ error: "ID du livrable invalide" });
  }

  const query = "DELETE FROM Livrable WHERE idLivrable = ?";

  db.query(query, [idLivrable], (err, results) => {
    if (err) {
      console.error("Erreur lors de la suppression du livrable:", err);
      return res.status(500).json({ error: "Erreur serveur lors de la suppression du livrable" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Livrable non trouvé" });
    }

    res.status(200).json({ message: "Livrable supprimé avec succès" });
  });
});

// Mettre à jour le statut d'un livrable
app.put("/api/livrables/:idLivrable/statut", (req, res) => {
  const { idLivrable } = req.params;
  const { statut } = req.body;

  if (!statut || !["Validé", "Rejeté"].includes(statut)) {
    return res.status(400).json({ error: "Statut invalide" });
  }

  const query = `
    UPDATE Livrable
    SET statut = ?
    WHERE idLivrable = ?;
  `;

  db.query(query, [statut, idLivrable], (err, results) => {
    if (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      return res.status(500).json({ error: "Échec de la mise à jour du statut" });
    }
    res.status(200).json({ message: "Statut mis à jour avec succès" });
  });
});

// Ajouter un commentaire à un livrable
app.put("/api/livrables/:idLivrable/commentaires", (req, res) => {
  const { idLivrable } = req.params;
  const { commentaire } = req.body;

  if (!commentaire) {
    return res.status(400).json({ error: "Le commentaire est requis" });
  }

  // Vérifier d'abord si le livrable existe
  const checkQuery = "SELECT * FROM Livrable WHERE idLivrable = ?";
  db.query(checkQuery, [idLivrable], (err, results) => {
    if (err) {
      console.error("Erreur SQL:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Livrable non trouvé" });
    }

    // Récupérer les commentaires existants
    let commentaires = [];
    try {
      commentaires = results[0].commentaires 
        ? JSON.parse(results[0].commentaires) 
        : [];
    } catch (e) {
      console.error("Erreur de parsing des commentaires:", e);
    }

    // Ajouter le nouveau commentaire
    commentaires.push(commentaire);

    // Mettre à jour le livrable
    const updateQuery = `
      UPDATE Livrable
      SET commentaires = ?
      WHERE idLivrable = ?;
    `;

    db.query(
      updateQuery, 
      [JSON.stringify(commentaires), idLivrable], 
      (err, updateResults) => {
        if (err) {
          console.error("Erreur SQL:", err);
          return res.status(500).json({ error: "Échec de l'ajout du commentaire" });
        }
        
        res.status(200).json({ 
          message: "Commentaire ajouté avec succès",
          commentaires: commentaires
        });
      }
    );
  });
});
//______________
// Récupérer tous les suivis
app.get("/api/suivis", (req, res) => {
  const query = `
    SELECT idSuivi, dateSuivi, nom, prenom, note, etatAvancement, pointsBloquants
    FROM SuiviPFE;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des suivis:", err);
      return res.status(500).json({ error: "Échec de la récupération des suivis" });
    }
    res.status(200).json(results);
  });
});

// Ajouter un nouveau suivi
app.post("/api/suivis", (req, res) => {
  const { dateSuivi, nom, prenom, note, etatAvancement, pointsBloquants, idTuteur } = req.body;

  console.log("Request Body:", req.body); // Log the request body

  // Vérification des champs obligatoires
  if (!dateSuivi || !nom || !prenom || !note || !etatAvancement || !pointsBloquants) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  // Requête SQL pour insérer un nouveau suivi
  const query = `
    INSERT INTO SuiviPFE (dateSuivi, nom, prenom, note, etatAvancement, pointsBloquants, idTuteur)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  console.log("SQL Query:", query); // Log the SQL query

  db.query(
    query,
    [dateSuivi, nom, prenom, note, etatAvancement, pointsBloquants, idTuteur || null],
    (err, results) => {
      if (err) {
        console.error("Erreur lors de l'insertion du suivi:", err);
        return res.status(500).json({ error: "Échec de l'insertion du suivi" });
      }
      res.status(201).json({ message: "Suivi ajouté avec succès", id: results.insertId });
    }
  );
});

// Mettre à jour un suivi
app.put("/api/suivis/:idSuivi", (req, res) => {
  const { idSuivi } = req.params;
  const { dateSuivi, nom, prenom, note, etatAvancement, pointsBloquants } = req.body;

  // Vérification des champs obligatoires
  if (!dateSuivi || !nom || !prenom || !note || !etatAvancement || !pointsBloquants) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  // Requête SQL pour mettre à jour un suivi
  const query = `
    UPDATE SuiviPFE
    SET dateSuivi = ?, nom = ?, prenom = ?, note = ?, etatAvancement = ?, pointsBloquants = ?
    WHERE idSuivi = ?;
  `;

  db.query(
    query,
    [dateSuivi, nom, prenom, note, etatAvancement, pointsBloquants, idSuivi],
    (err, results) => {
      if (err) {
        console.error("Erreur lors de la mise à jour du suivi:", err);
        return res.status(500).json({ error: "Échec de la mise à jour du suivi" });
      }
      res.status(200).json({ message: "Suivi mis à jour avec succès" });
    }
  );
});

// Supprimer un suivi
app.delete("/api/suivis/:idSuivi", (req, res) => {
  const { idSuivi } = req.params;

  // Requête SQL pour supprimer un suivi
  const query = "DELETE FROM SuiviPFE WHERE idSuivi = ?";

  db.query(query, [idSuivi], (err, results) => {
    if (err) {
      console.error("Erreur lors de la suppression du suivi:", err);
      return res.status(500).json({ error: "Échec de la suppression du suivi" });
    }
    res.status(200).json({ message: "Suivi supprimé avec succès" });
  });
});



//reunions
app.get("/api/reunions/:id", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT r.*, GROUP_CONCAT(CONCAT(rp.participantType, ':', rp.participantId)) AS participants
    FROM Reunion r
    LEFT JOIN ReunionParticipant rp ON r.idReunion = rp.idReunion
    WHERE r.idReunion = ?
    GROUP BY r.idReunion
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération de la réunion:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Réunion non trouvée" });
    }

    const reunion = {
      ...results[0],
      participants: results[0].participants ? results[0].participants.split(",") : [],
    };

    res.json(reunion);
  });
});
// Récupérer tous les participants (étudiants, tuteurs, encadrants)
app.get("/api/participants", (req, res) => {
  const query = `
    SELECT 'etudiant' AS type, idEtudiant AS id, CONCAT(nom, ' ', prenom) AS name FROM Etudiant
    UNION ALL
    SELECT 'tuteur' AS type, idTuteur AS id, CONCAT(nom, ' ', prenom) AS name FROM Tuteur
    UNION ALL
    SELECT 'encadrant' AS type, idEncadrant AS id, CONCAT(nom, ' ', prenom) AS name FROM Encadrant
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des participants:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(results);
  });
});

// Récupérer toutes les réunions
app.get("/api/reunions", (req, res) => {
  const query = `
    SELECT r.*, GROUP_CONCAT(CONCAT(rp.participantType, ':', rp.participantId)) AS participants
    FROM Reunion r
    LEFT JOIN ReunionParticipant rp ON r.idReunion = rp.idReunion
    GROUP BY r.idReunion
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des réunions:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    const reunions = results.map((r) => ({
      ...r,
      participants: r.participants ? r.participants.split(",") : [],
    }));

    console.log("Réunions récupérées:", reunions); // Log the fetched meetings
    res.json(reunions);
  });
});

// Créer une réunion
app.post("/api/reunions", (req, res) => {
  const { sujet, date, heure, agenda, participants, createurId, createurType } = req.body;

  // Insérer la réunion dans la table Reunion
  const insertReunionQuery = `
    INSERT INTO Reunion (sujet, date, heure, agenda, ${createurType === "etudiant" ? "idEtudiant" : createurType === "tuteur" ? "idTuteur" : "idEncadrant"})
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(insertReunionQuery, [sujet, date, heure, agenda, createurId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la création de la réunion:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    const idReunion = result.insertId; // Récupérer l'idReunion généré

    // Insérer les participants dans la table ReunionParticipant
    if (participants && participants.length > 0) {
      const insertParticipantsQuery = `
        INSERT INTO ReunionParticipant (idReunion, participantType, participantId)
        VALUES ?
      `;
      const participantsValues = participants.map((p) => {
        const [type, id] = p.split(":");
        return [idReunion, type, id]; // Utiliser l'idReunion correct
      });

      db.query(insertParticipantsQuery, [participantsValues], (err) => {
        if (err) {
          console.error("Erreur lors de l'ajout des participants:", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }

        res.json({ idReunion, sujet, date, heure, agenda, participants });
      });
    } else {
      res.json({ idReunion, sujet, date, heure, agenda, participants: [] });
    }
  });
});

// Supprimer une réunion
app.delete("/api/reunions/:id", (req, res) => {
  const { id } = req.params;

  const deleteQuery = "DELETE FROM Reunion WHERE idReunion = ?";
  db.query(deleteQuery, [id], (err) => {
    if (err) {
      console.error("Erreur lors de la suppression de la réunion:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json({ message: "Réunion supprimée avec succès" });
  });
});

// Mettre à jour une réunion
app.put("/api/reunions/:id", (req, res) => {
  const { id } = req.params;
  const { sujet, date, heure, agenda, participants } = req.body;

  // Mettre à jour la réunion dans la table Reunion
  const updateQuery = `
    UPDATE Reunion
    SET sujet = ?, date = ?, heure = ?, agenda = ?
    WHERE idReunion = ?
  `;

  db.query(updateQuery, [sujet, date, heure, agenda, id], (err) => {
    if (err) {
      console.error("Erreur lors de la mise à jour de la réunion:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    // Supprimer les anciens participants
    const deleteParticipantsQuery = "DELETE FROM ReunionParticipant WHERE idReunion = ?";
    db.query(deleteParticipantsQuery, [id], (err) => {
      if (err) {
        console.error("Erreur lors de la suppression des participants:", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      // Ajouter les nouveaux participants
      if (participants && participants.length > 0) {
        const insertParticipantsQuery = `
          INSERT INTO ReunionParticipant (idReunion, participantType, participantId)
          VALUES ?
        `;
        const participantsValues = participants.map((p) => {
          const [type, idParticipant] = p.split(":");
          return [id, type, idParticipant]; // Utiliser l'idReunion correct
        });

        db.query(insertParticipantsQuery, [participantsValues], (err) => {
          if (err) {
            console.error("Erreur lors de l'ajout des participants:", err);
            return res.status(500).json({ error: "Erreur serveur" });
          }

          res.json({ message: "Réunion mise à jour avec succès" });
        });
      } else {
        res.json({ message: "Réunion mise à jour avec succès" });
      }
    });
  });
});
// Notification Endpoints
app.post("/api/notifications", (req, res) => {
  const { title, content, recipients } = req.body;
  
  db.query(
    "INSERT INTO Notification (title, content) VALUES (?, ?)",
    [title, content],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const notificationId = result.insertId;
      const recipientValues = recipients.map(r => {
        const [type, id] = r.split(":");
        return [notificationId, type, id];
      });
      
      db.query(
        "INSERT INTO NotificationRecipient (idNotification, recipientType, recipientId) VALUES ?",
        [recipientValues],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: notificationId });
        }
      );
    }
  );
});

app.get("/api/notifications/:type/:id", (req, res) => {
  const { type, id } = req.params;
  
  const query = `
    SELECT n.* FROM Notification n
    JOIN NotificationRecipient nr ON n.idNotification = nr.idNotification
    WHERE nr.recipientType = ? AND nr.recipientId = ?
    ORDER BY n.date DESC
  `;
  
  db.query(query, [type, id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE Notification SET isRead = TRUE WHERE idNotification = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Notification marked as read" });
    }
  );
});

// Reunion Endpoints
app.get("/api/reunions", (req, res) => {
  const query = `
    SELECT r.*, GROUP_CONCAT(CONCAT(rp.participantType, ':', rp.participantId)) AS participants
    FROM Reunion r
    LEFT JOIN ReunionParticipant rp ON r.idReunion = rp.idReunion
    GROUP BY r.idReunion
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.map(r => ({
      ...r,
      participants: r.participants ? r.participants.split(",") : []
    })));
  });
});

app.post("/api/reunions", (req, res) => {
  const { sujet, date, heure, agenda, participants, createurId, createurType } = req.body;
  
  const query = `
    INSERT INTO Reunion (sujet, date, heure, agenda, createurType, createurId)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [sujet, date, heure, agenda, createurType, createurId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const idReunion = result.insertId;
    
    if (participants?.length > 0) {
      const values = participants.map(p => {
        const [type, id] = p.split(":");
        return [idReunion, type, id];
      });
      
      db.query(
        "INSERT INTO ReunionParticipant (idReunion, participantType, participantId) VALUES ?",
        [values],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ idReunion, sujet, date, heure, agenda, participants });
        }
      );
    } else {
      res.json({ idReunion, sujet, date, heure, agenda, participants: [] });
    }
  });
});

app.put("/api/reunions/:id", (req, res) => {
  const { id } = req.params;
  const { sujet, date, heure, agenda, participants } = req.body;

  db.query(
    "UPDATE Reunion SET sujet = ?, date = ?, heure = ?, agenda = ? WHERE idReunion = ?",
    [sujet, date, heure, agenda, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query(
        "DELETE FROM ReunionParticipant WHERE idReunion = ?",
        [id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });

          if (participants?.length > 0) {
            const values = participants.map(p => {
              const [type, idParticipant] = p.split(":");
              return [id, type, idParticipant];
            });

            db.query(
              "INSERT INTO ReunionParticipant (idReunion, participantType, participantId) VALUES ?",
              [values],
              (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Meeting updated successfully" });
              }
            );
          } else {
            res.json({ message: "Meeting updated successfully" });
          }
        }
      );
    }
  );
});

app.delete("/api/reunions/:id", (req, res) => {
  const { id } = req.params;
  
  db.query(
    "DELETE FROM Reunion WHERE idReunion = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Meeting deleted successfully" });
    }
  );
});

// Participants Endpoint
app.get("/api/participants", (req, res) => {
  const query = `
    SELECT 'etudiant' AS type, idEtudiant AS id, CONCAT(nom, ' ', prenom) AS name FROM Etudiant
    UNION ALL
    SELECT 'tuteur' AS type, idTuteur AS id, CONCAT(nom, ' ', prenom) AS name FROM Tuteur
    UNION ALL
    SELECT 'encadrant' AS type, idEncadrant AS id, CONCAT(nom, ' ', prenom) AS name FROM Encadrant
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// discussions

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

// Récupérer les discussions
app.get('/api/discussions', (req, res) => {
  const query = `
    SELECT d.idDiscussion, d.titre, d.dateCreation,
           dp.idParticipant, dp.typeParticipant,
           COALESCE(e.nom, t.nom, en.nom, r.nom) as nom,
           COALESCE(e.prenom, t.prenom, en.prenom, r.prenom) as prenom,
           CASE 
             WHEN d.idEtudiant = dp.idParticipant AND dp.typeParticipant = 'etudiant' THEN 1
             WHEN d.idTuteur = dp.idParticipant AND dp.typeParticipant = 'tuteur' THEN 1
             WHEN d.idEncadrant = dp.idParticipant AND dp.typeParticipant = 'encadrant' THEN 1
             WHEN d.idResponsableFiliere = dp.idParticipant AND dp.typeParticipant = 'responsable' THEN 1
             ELSE 0
           END as isCreator
    FROM Discussion d
    JOIN DiscussionParticipants dp ON d.idDiscussion = dp.idDiscussion
    LEFT JOIN Etudiant e ON dp.typeParticipant = 'etudiant' AND dp.idParticipant = e.idEtudiant
    LEFT JOIN Tuteur t ON dp.typeParticipant = 'tuteur' AND dp.idParticipant = t.idTuteur
    LEFT JOIN Encadrant en ON dp.typeParticipant = 'encadrant' AND dp.idParticipant = en.idEncadrant
    LEFT JOIN ResponsableFiliere r ON dp.typeParticipant = 'responsable' AND dp.idParticipant = r.idResponsableFiliere
    ORDER BY d.dateCreation DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }

    const discussions = {};
    results.forEach(row => {
      if (!discussions[row.idDiscussion]) {
        discussions[row.idDiscussion] = {
          idDiscussion: row.idDiscussion,
          titre: row.titre,
          dateCreation: row.dateCreation,
          participants: []
        };
      }
      discussions[row.idDiscussion].participants.push({
        id: row.idParticipant,
        type: row.typeParticipant,
        nom: row.nom,
        prenom: row.prenom,
        isCreator: row.isCreator === 1
      });
    });

    res.json(Object.values(discussions));
  });
});

// Créer une discussion
app.post('/api/discussions', (req, res) => {
  const { titre, createurId, typeCreateur, participants } = req.body;

  if (!titre || !createurId || !typeCreateur) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  const validTypes = ['etudiant', 'encadrant', 'tuteur', 'responsable'];
  if (!validTypes.includes(typeCreateur)) {
    return res.status(400).json({ error: 'Type de créateur invalide' });
  }

  db.beginTransaction(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur de transaction' });
    }

    const creatorFieldMap = {
      etudiant: 'idEtudiant',
      encadrant: 'idEncadrant',
      tuteur: 'idTuteur',
      responsable: 'idResponsableFiliere'
    };
    const creatorField = creatorFieldMap[typeCreateur];
    
    const queryDiscussion = `
      INSERT INTO Discussion (titre, ${creatorField}, dateCreation)
      VALUES (?, ?, NOW())
    `;

    db.query(queryDiscussion, [titre, createurId], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error(err);
          res.status(500).json({ error: 'Erreur création discussion' });
        });
      }

      const idDiscussion = result.insertId;
      const participantsToAdd = [
        { id: createurId, type: typeCreateur },
        ...(participants || [])
      ];

      const participantQueries = participantsToAdd.map(participant => {
        return new Promise((resolve, reject) => {
          const query = `
            INSERT INTO DiscussionParticipants (idDiscussion, idParticipant, typeParticipant)
            VALUES (?, ?, ?)
          `;
          db.query(query, [idDiscussion, participant.id, participant.type], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });

      Promise.all(participantQueries)
        .then(() => {
          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                console.error(err);
                res.status(500).json({ error: 'Erreur de commit' });
              });
            }
            
            const participantIds = participantsToAdd.map(p => p.id);
            const participantTypes = participantsToAdd.map(p => p.type);
            
            const getParticipantsQuery = `
              SELECT 
                idParticipant as id, 
                typeParticipant as type,
                COALESCE(e.nom, t.nom, en.nom, r.nom) as nom,
                COALESCE(e.prenom, t.prenom, en.prenom, r.prenom) as prenom,
                CASE 
                  WHEN d.idEtudiant = dp.idParticipant AND dp.typeParticipant = 'etudiant' THEN 1
                  WHEN d.idTuteur = dp.idParticipant AND dp.typeParticipant = 'tuteur' THEN 1
                  WHEN d.idEncadrant = dp.idParticipant AND dp.typeParticipant = 'encadrant' THEN 1
                  WHEN d.idResponsableFiliere = dp.idParticipant AND dp.typeParticipant = 'responsable' THEN 1
                  ELSE 0
                END as isCreator
              FROM Discussion d
              JOIN DiscussionParticipants dp ON d.idDiscussion = dp.idDiscussion
              LEFT JOIN Etudiant e ON dp.typeParticipant = 'etudiant' AND dp.idParticipant = e.idEtudiant
              LEFT JOIN Tuteur t ON dp.typeParticipant = 'tuteur' AND dp.idParticipant = t.idTuteur
              LEFT JOIN Encadrant en ON dp.typeParticipant = 'encadrant' AND dp.idParticipant = en.idEncadrant
              LEFT JOIN ResponsableFiliere r ON dp.typeParticipant = 'responsable' AND dp.idParticipant = r.idResponsableFiliere
              WHERE dp.idDiscussion = ? AND (
                ${participantTypes.map((t, i) => `(dp.idParticipant = ? AND dp.typeParticipant = ?)`).join(' OR ')}
            `;
            
            const params = [idDiscussion];
            participantsToAdd.forEach(p => {
              params.push(p.id, p.type);
            });
            
            db.query(getParticipantsQuery, params, (err, participantResults) => {
              if (err) {
                console.error('Erreur récupération participants:', err);
                return res.status(201).json({
                  idDiscussion,
                  titre,
                  dateCreation: new Date().toISOString(),
                  participants: participantsToAdd
                });
              }
              
              res.status(201).json({
                idDiscussion,
                titre,
                dateCreation: new Date().toISOString(),
                participants: participantResults
              });
            });
          });
        })
        .catch(err => {
          db.rollback(() => {
            console.error(err);
            res.status(500).json({ error: 'Erreur ajout participants' });
          });
        });
    });
  });
});

// Supprimer une discussion
app.delete('/api/discussions/:id', (req, res) => {
  const { id } = req.params;

  db.beginTransaction(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur de transaction' });
    }

    const deleteParticipantsQuery = 'DELETE FROM DiscussionParticipants WHERE idDiscussion = ?';
    db.query(deleteParticipantsQuery, [id], (err) => {
      if (err) {
        return db.rollback(() => {
          console.error(err);
          res.status(500).json({ error: 'Erreur suppression participants' });
        });
      }

      const deleteMessagesQuery = 'DELETE FROM Message WHERE idDiscussion = ?';
      db.query(deleteMessagesQuery, [id], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error(err);
            res.status(500).json({ error: 'Erreur suppression messages' });
          });
        }

        const deleteDiscussionQuery = 'DELETE FROM Discussion WHERE idDiscussion = ?';
        db.query(deleteDiscussionQuery, [id], (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error(err);
              res.status(500).json({ error: 'Erreur suppression discussion' });
            });
          }

          if (result.affectedRows === 0) {
            return db.rollback(() => {
              res.status(404).json({ error: 'Discussion non trouvée' });
            });
          }

          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                console.error(err);
                res.status(500).json({ error: 'Erreur de commit' });
              });
            }
            res.json({ success: true });
          });
        });
      });
    });
  });
});

// Modifier une discussion
app.put('/api/discussions/:id', (req, res) => {
  const { id } = req.params;
  const { titre, participants } = req.body;

  if (!titre) {
    return res.status(400).json({ error: 'Titre manquant' });
  }

  db.beginTransaction(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur de transaction' });
    }

    const updateQuery = 'UPDATE Discussion SET titre = ? WHERE idDiscussion = ?';
    db.query(updateQuery, [titre, id], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error(err);
          res.status(500).json({ error: 'Erreur mise à jour discussion' });
        });
      }

      if (result.affectedRows === 0) {
        return db.rollback(() => {
          res.status(404).json({ error: 'Discussion non trouvée' });
        });
      }

      if (participants) {
        const deleteParticipantsQuery = `
          DELETE FROM DiscussionParticipants 
          WHERE idDiscussion = ? 
          AND (idParticipant, typeParticipant) NOT IN (
            SELECT idEtudiant, 'etudiant' FROM Discussion WHERE idDiscussion = ? AND idEtudiant IS NOT NULL
            UNION
            SELECT idTuteur, 'tuteur' FROM Discussion WHERE idDiscussion = ? AND idTuteur IS NOT NULL
            UNION
            SELECT idEncadrant, 'encadrant' FROM Discussion WHERE idDiscussion = ? AND idEncadrant IS NOT NULL
            UNION
            SELECT idResponsableFiliere, 'responsable' FROM Discussion WHERE idDiscussion = ? AND idResponsableFiliere IS NOT NULL
          )
        `;
        
        db.query(deleteParticipantsQuery, [id, id, id, id, id], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error(err);
              res.status(500).json({ error: 'Erreur suppression participants' });
            });
          }

          const insertQueries = participants.map(participant => {
            return new Promise((resolve, reject) => {
              const checkQuery = `
                SELECT 1 FROM DiscussionParticipants 
                WHERE idDiscussion = ? AND idParticipant = ? AND typeParticipant = ?
              `;
              db.query(checkQuery, [id, participant.id, participant.type], (err, results) => {
                if (err) return reject(err);
                if (results.length > 0) return resolve();

                const insertQuery = `
                  INSERT INTO DiscussionParticipants (idDiscussion, idParticipant, typeParticipant)
                  VALUES (?, ?, ?)
                `;
                db.query(insertQuery, [id, participant.id, participant.type], (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              });
            });
          });

          Promise.all(insertQueries)
            .then(() => {
              db.commit(err => {
                if (err) {
                  return db.rollback(() => {
                    console.error(err);
                    res.status(500).json({ error: 'Erreur de commit' });
                  });
                }
                res.json({ success: true });
              });
            })
            .catch(err => {
              db.rollback(() => {
                console.error(err);
                res.status(500).json({ error: 'Erreur ajout participants' });
              });
            });
        });
      } else {
        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              console.error(err);
              res.status(500).json({ error: 'Erreur de commit' });
            });
          }
          res.json({ success: true });
        });
      }
    });
  });
});

// Récupérer les messages d'une discussion
app.get('/api/discussions/:id/messages', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT m.idMessage, m.contenu as content, m.dateEnvoi, m.aDesFichiers,
           COALESCE(e.idEtudiant, t.idTuteur, en.idEncadrant, r.idResponsableFiliere) as idAuteur,
           COALESCE(
             CASE WHEN e.idEtudiant IS NOT NULL THEN 'etudiant'
                  WHEN t.idTuteur IS NOT NULL THEN 'tuteur'
                  WHEN en.idEncadrant IS NOT NULL THEN 'encadrant'
                  WHEN r.idResponsableFiliere IS NOT NULL THEN 'responsable'
             END
           ) as typeAuteur,
           COALESCE(e.nom, t.nom, en.nom, r.nom) as nom,
           COALESCE(e.prenom, t.prenom, en.prenom, r.prenom) as prenom,
           m.idMessageRepondu
    FROM Message m
    LEFT JOIN Etudiant e ON m.idEtudiant = e.idEtudiant
    LEFT JOIN Tuteur t ON m.idTuteur = t.idTuteur
    LEFT JOIN Encadrant en ON m.idEncadrant = en.idEncadrant
    LEFT JOIN ResponsableFiliere r ON m.idResponsableFiliere = r.idResponsableFiliere
    WHERE m.idDiscussion = ?
    ORDER BY m.dateEnvoi ASC
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    res.json(results);
  });
});

// Envoyer un nouveau message
app.post('/api/discussions/:id/messages', (req, res) => {
  const { id } = req.params;
  const { content, idAuteur, typeAuteur, replyTo } = req.body;

  if (!content && !req.files) {
    return res.status(400).json({ error: 'Message ou fichier requis' });
  }

  const fieldMap = {
    etudiant: 'idEtudiant',
    tuteur: 'idTuteur',
    encadrant: 'idEncadrant',
    responsable: 'idResponsableFiliere'
  };
  const idField = fieldMap[typeAuteur];

  const query = `
    INSERT INTO Message (contenu, dateEnvoi, idDiscussion, ${idField}, idMessageRepondu)
    VALUES (?, NOW(), ?, ?, ?)
  `;

  db.query(query, [content || '', id, idAuteur, replyTo || null], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur création message' });
    }

    const messageId = result.insertId;
    
    // Si des fichiers sont joints, les traiter
    if (req.files && req.files.length > 0) {
      const fileQueries = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const fileQuery = `
            INSERT INTO FichierJoint (nomFichier, cheminFichier, typeMIME, taille, idMessage)
            VALUES (?, ?, ?, ?, ?)
          `;
          db.query(fileQuery, [
            file.originalname,
            file.filename,
            file.mimetype,
            file.size,
            messageId
          ], (err, fileResult) => {
            if (err) reject(err);
            else resolve(fileResult);
          });
        });
      });

      Promise.all(fileQueries)
        .then(() => {
          // Mettre à jour le message pour indiquer qu'il a des fichiers
          db.query(
            'UPDATE Message SET aDesFichiers = TRUE WHERE idMessage = ?',
            [messageId],
            (err) => {
              if (err) console.error('Erreur mise à jour message:', err);
              fetchMessageWithAttachments();
            }
          );
        })
        .catch(err => {
          console.error('Erreur enregistrement fichiers:', err);
          fetchMessageWithAttachments();
        });
    } else {
      fetchMessageWithAttachments();
    }

    function fetchMessageWithAttachments() {
      const getQuery = `
        SELECT m.idMessage, m.contenu as content, m.dateEnvoi, m.aDesFichiers,
               ? as idAuteur, ? as typeAuteur,
               COALESCE(e.nom, t.nom, en.nom, r.nom) as nom,
               COALESCE(e.prenom, t.prenom, en.prenom, r.prenom) as prenom
        FROM Message m
        LEFT JOIN Etudiant e ON m.idEtudiant = e.idEtudiant
        LEFT JOIN Tuteur t ON m.idTuteur = t.idTuteur
        LEFT JOIN Encadrant en ON m.idEncadrant = en.idEncadrant
        LEFT JOIN ResponsableFiliere r ON m.idResponsableFiliere = r.idResponsableFiliere
        WHERE m.idMessage = ?
      `;

      db.query(getQuery, [idAuteur, typeAuteur, messageId], (err, [message]) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Erreur récupération message' });
        }
        res.status(201).json(message);
      });
    }
  });
});

// Route pour uploader un fichier joint à un message
app.post('/api/messages/:id/upload', upload.array('file'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { id } = req.params;

    const fileQueries = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO FichierJoint (nomFichier, cheminFichier, typeMIME, taille, idMessage)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(query, [
          file.originalname,
          file.filename,
          file.mimetype,
          file.size,
          id
        ], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    });

    const results = await Promise.all(fileQueries);
    
    db.query(
      'UPDATE Message SET aDesFichiers = TRUE WHERE idMessage = ?',
      [id],
      (err) => {
        if (err) {
          console.error('Error updating message:', err);
        }
      }
    );

    const uploadedFiles = results.map((result, index) => ({
      idFichier: result.insertId,
      nomFichier: req.files[index].originalname,
      cheminFichier: req.files[index].filename,
      typeMIME: req.files[index].mimetype,
      taille: req.files[index].size
    }));

    res.status(201).json(uploadedFiles);
  } catch (error) {
    console.error(error);
    
    // Clean up uploaded files if error occurred
    if (req.files) {
      req.files.forEach(file => {
        fs.unlinkSync(path.join(uploadDir, file.filename));
      });
    }
    
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Route pour récupérer les fichiers joints d'un message
app.get('/api/messages/:id/files', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT * FROM FichierJoint 
    WHERE idMessage = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    res.json(results);
  });
});

// Route pour supprimer un fichier joint
app.delete('/api/files/:id', (req, res) => {
  const { id } = req.params;

  db.beginTransaction(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur de transaction' });
    }

    // D'abord récupérer les infos du fichier
    const getFileQuery = 'SELECT cheminFichier, idMessage FROM FichierJoint WHERE idFichier = ?';
    db.query(getFileQuery, [id], (err, [file]) => {
      if (err) {
        return db.rollback(() => {
          console.error(err);
          res.status(500).json({ error: 'Erreur récupération fichier' });
        });
      }

      if (!file) {
        return db.rollback(() => {
          res.status(404).json({ error: 'Fichier non trouvé' });
        });
      }

      // Supprimer l'entrée de la base de données
      const deleteQuery = 'DELETE FROM FichierJoint WHERE idFichier = ?';
      db.query(deleteQuery, [id], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error(err);
            res.status(500).json({ error: 'Erreur suppression fichier' });
          });
        }

        // Vérifier s'il reste des fichiers pour ce message
        const checkFilesQuery = 'SELECT 1 FROM FichierJoint WHERE idMessage = ? LIMIT 1';
        db.query(checkFilesQuery, [file.idMessage], (err, results) => {
          if (err) {
            return db.rollback(() => {
              console.error(err);
              res.status(500).json({ error: 'Erreur vérification fichiers' });
            });
          }

          // Mettre à jour le flag aDesFichiers si plus de fichiers
          if (results.length === 0) {
            db.query(
              'UPDATE Message SET aDesFichiers = FALSE WHERE idMessage = ?',
              [file.idMessage],
              (err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error(err);
                    res.status(500).json({ error: 'Erreur mise à jour message' });
                  });
                }
              }
            );
          }

          // Supprimer le fichier physique
          const filePath = path.join(uploadDir, file.cheminFichier);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Erreur suppression fichier physique:', err);
              // On continue quand même car l'entrée DB est déjà supprimée
            }

            db.commit(err => {
              if (err) {
                return db.rollback(() => {
                  console.error(err);
                  res.status(500).json({ error: 'Erreur de commit' });
                });
              }
              res.json({ success: true });
            });
          });
        });
      });
    });
  });
});

// Modifier un message
app.put('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Contenu manquant' });
  }

  const query = 'UPDATE Message SET contenu = ? WHERE idMessage = ?';
  
  db.query(query, [content, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur modification message' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    res.json({ success: true });
  });
});

// Supprimer un message
app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;

  db.beginTransaction(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur de transaction' });
    }

    // D'abord supprimer les fichiers joints
    const deleteFilesQuery = 'DELETE FROM FichierJoint WHERE idMessage = ?';
    db.query(deleteFilesQuery, [id], (err) => {
      if (err) {
        return db.rollback(() => {
          console.error(err);
          res.status(500).json({ error: 'Erreur suppression fichiers joints' });
        });
      }

      // Puis supprimer le message
      const deleteMessageQuery = 'DELETE FROM Message WHERE idMessage = ?';
      db.query(deleteMessageQuery, [id], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error(err);
            res.status(500).json({ error: 'Erreur suppression message' });
          });
        }

        if (result.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({ error: 'Message non trouvé' });
          });
        }

        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              console.error(err);
              res.status(500).json({ error: 'Erreur de commit' });
            });
          }
          res.json({ success: true });
        });
      });
    });
  });
});

// ____________________
// Middleware
app.use(cors());
app.use(express.json());

// DASHBOARD ENDPOINTS

// Get all statistics
app.get('/api/dashboard/stats', (req, res) => {
  // Get student count
  db.query('SELECT COUNT(*) as totalStudents FROM Etudiant', (err, studentResult) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Get deliverable counts
    db.query(`
      SELECT 
        SUM(CASE WHEN statut = "Soumis" THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN statut = "Validé" THEN 1 ELSE 0 END) as validated,
        SUM(CASE WHEN statut = "Rejeté" THEN 1 ELSE 0 END) as rejected
      FROM Livrable
    `, (err, deliverableResult) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({
        totalStudents: studentResult[0].totalStudents,
        submittedDeliverables: deliverableResult[0].submitted,
        validatedDeliverables: deliverableResult[0].validated,
        rejectedDeliverables: deliverableResult[0].rejected
      });
    });
  });
});

// Get deliverable status over time
// In your server.js, modify the deliverable-status endpoint:
app.get('/api/dashboard/deliverable-status', (req, res) => {
  db.query(`
    SELECT 
      DATE_FORMAT(dateSoumission, '%Y-%m') as name,
      SUM(statut = 'Soumis') as submitted,
      SUM(statut = 'Validé') as validated,
      SUM(statut = 'Rejeté') as rejected
    FROM Livrable
    GROUP BY name
    ORDER BY name
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // If no data, return sample data for demonstration
    if (results.length === 0) {
      results = [
        { name: '2023-10', submitted: 2, validated: 1, rejected: 1 },
        { name: '2023-11', submitted: 3, validated: 2, rejected: 0 }
      ];
    }
    
    res.json(results);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log('Dashboard endpoints:');
  console.log(`- GET http://localhost:${port}/api/dashboard/stats`);
  console.log(`- GET http://localhost:${port}/api/dashboard/deliverable-status`);
  console.log(`- POST http://localhost:${port}/api/test-data (for testing)`);
});