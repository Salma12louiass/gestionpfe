/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP DATABASE IF EXISTS `gestionpfe`;
CREATE DATABASE IF NOT EXISTS `gestionpfe` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `gestionpfe`;

DROP VIEW IF EXISTS `allparticipants`;
CREATE TABLE `allparticipants` (
	`type` VARCHAR(9) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`id` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`name` VARCHAR(101) NOT NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

DROP TABLE IF EXISTS `discussion`;
CREATE TABLE IF NOT EXISTS `discussion` (
  `idDiscussion` int NOT NULL AUTO_INCREMENT,
  `titre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `idEtudiant` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idEncadrant` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idTuteur` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idResponsableFiliere` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dateCreation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idDiscussion`),
  KEY `idEtudiant` (`idEtudiant`),
  KEY `idEncadrant` (`idEncadrant`),
  KEY `idTuteur` (`idTuteur`),
  KEY `idResponsableFiliere` (`idResponsableFiliere`),
  CONSTRAINT `discussion_ibfk_1` FOREIGN KEY (`idEtudiant`) REFERENCES `etudiant` (`idEtudiant`) ON DELETE SET NULL,
  CONSTRAINT `discussion_ibfk_2` FOREIGN KEY (`idEncadrant`) REFERENCES `encadrant` (`idEncadrant`) ON DELETE SET NULL,
  CONSTRAINT `discussion_ibfk_3` FOREIGN KEY (`idTuteur`) REFERENCES `tuteur` (`idTuteur`) ON DELETE SET NULL,
  CONSTRAINT `discussion_ibfk_4` FOREIGN KEY (`idResponsableFiliere`) REFERENCES `responsablefiliere` (`idResponsableFiliere`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `discussion` (`idDiscussion`, `titre`, `idEtudiant`, `idEncadrant`, `idTuteur`, `idResponsableFiliere`, `dateCreation`) VALUES
	(24, 'salma1', NULL, 'E001', NULL, NULL, '2025-03-29 18:08:54'),
	(34, 'discussion1', NULL, 'E001', NULL, NULL, '2025-04-05 10:35:29'),
	(38, 'test', NULL, 'E001', NULL, NULL, '2025-04-08 16:33:57'),
	(39, 'concernant test', 'ET123', NULL, NULL, NULL, '2025-04-10 20:15:24');

DROP TABLE IF EXISTS `discussionparticipants`;
CREATE TABLE IF NOT EXISTS `discussionparticipants` (
  `idDiscussion` int NOT NULL,
  `idParticipant` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `typeParticipant` enum('etudiant','encadrant','tuteur','responsable') COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`idDiscussion`,`idParticipant`,`typeParticipant`),
  CONSTRAINT `discussionparticipants_ibfk_1` FOREIGN KEY (`idDiscussion`) REFERENCES `discussion` (`idDiscussion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `discussionparticipants` (`idDiscussion`, `idParticipant`, `typeParticipant`) VALUES
	(24, 'E001', 'encadrant'),
	(24, 'ET003', 'etudiant'),
	(24, 'ET006', 'etudiant'),
	(24, 'ET123', 'etudiant'),
	(24, 'etudiant124', 'etudiant'),
	(24, 'T002', 'tuteur'),
	(24, 'T003', 'tuteur'),
	(34, '9et', 'etudiant'),
	(34, 'ABC123', 'encadrant'),
	(34, 'E003', 'encadrant'),
	(34, 'ET001', 'etudiant'),
	(34, 'ET002', 'etudiant'),
	(34, 'ET003', 'etudiant'),
	(34, 'ET123', 'etudiant'),
	(34, 'etudiant124', 'etudiant'),
	(38, '1', 'encadrant'),
	(38, 'ABC123', 'encadrant'),
	(38, 'E006', 'encadrant'),
	(38, 'ENC001', 'encadrant'),
	(38, 'ET123', 'etudiant'),
	(39, 'E003', 'encadrant'),
	(39, 'ENC001', 'encadrant'),
	(39, 'ET123', 'etudiant');

DROP TABLE IF EXISTS `encadrant`;
CREATE TABLE IF NOT EXISTS `encadrant` (
  `idEncadrant` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `nom` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `prenom` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `motDePasse` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `annee` int NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'encadrant',
  PRIMARY KEY (`idEncadrant`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `encadrant` (`idEncadrant`, `nom`, `prenom`, `email`, `motDePasse`, `annee`, `role`) VALUES
	('1', 'enc1', 'encadrant', 'enc@gmail.com', 'qweruyt', 2025, 'encadrant'),
	('ABC123', 'John', 'Doe', '', '', 0, 'encadrant'),
	('E001', 'Dupont', 'Jean', 'jean.dupont@example.com', 'rtyuioii', 2024, 'encadrant'),
	('E002', 'Martin', 'Sophie', 'sophie.martin@example.com', 'j1eno1nrvo', 2024, 'encadrant'),
	('E003', 'Bernard', 'Luc', 'luc.bernard@example.com', 'bwib', 2025, 'encadrant'),
	('E004', 'Morel', 'Claire', 'claire.morel@example.com', 'ffffggg', 2025, 'encadrant'),
	('E005', 'Robert', 'Pierre', 'pierre.robert@example.com', 'iudbi2b', 2023, 'encadrant'),
	('E006', 'Durand', 'Isabelle', 'isabelle.durand@example.com', 'uhubcebib', 2025, 'encadrant'),
	('ENC001', 'Bernard', 'Sophie', 'encadrant@est.com', '$2b$10$examplehash', 2023, 'encadrant'),
	('ENC123', 'Nom', 'Prénom', 'email@example.com', 'motdepasse', 2023, 'encadrant');

DROP TABLE IF EXISTS `encadrantsujet`;
CREATE TABLE IF NOT EXISTS `encadrantsujet` (
  `idEncadrant` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `idSujet` int NOT NULL,
  PRIMARY KEY (`idEncadrant`,`idSujet`),
  KEY `idSujet` (`idSujet`),
  CONSTRAINT `encadrantsujet_ibfk_1` FOREIGN KEY (`idEncadrant`) REFERENCES `encadrant` (`idEncadrant`),
  CONSTRAINT `encadrantsujet_ibfk_2` FOREIGN KEY (`idSujet`) REFERENCES `sujet` (`idSujet`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `etudiant`;
CREATE TABLE IF NOT EXISTS `etudiant` (
  `idEtudiant` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `nom` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `prenom` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `motDePasse` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `annee` int NOT NULL,
  `classe` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `filiere` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `idGroupe` int DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'etudiant',
  PRIMARY KEY (`idEtudiant`),
  UNIQUE KEY `email` (`email`),
  KEY `idGroupe` (`idGroupe`),
  CONSTRAINT `etudiant_ibfk_1` FOREIGN KEY (`idGroupe`) REFERENCES `groupe` (`idGroupe`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `etudiant` (`idEtudiant`, `nom`, `prenom`, `email`, `motDePasse`, `annee`, `classe`, `filiere`, `idGroupe`, `role`) VALUES
	('1', 'John', 'Doe', 'admin@est.ma', 'password', 2023, 'ClassA', 'Computer Science', NULL, 'etudiant'),
	('10', 'rg', 'hr', 'admin@rg.com', 'password', 2025, '2ème année', 'Génie Logiciel', NULL, 'etudiant'),
	('5et', 'Petit', 'Léo', 's5@gmail.com', 'motdepassedef', 2024, 'Classe C', 'Physique', NULL, 'etudiant'),
	('6et', 'Robert', 'Chloé', 's6@gmail.com', 'motdepasseghi', 2024, 'Classe C', 'Physique', NULL, 'etudiant'),
	('7et', 'Richard', 'Noah', 's7@gmail.com', 'motdepassejkl', 2024, 'Classe D', 'Chimie', NULL, 'etudiant'),
	('8et', 'Durand', 'Manon', 's8@gmail.com', 'motdepassemno', 2024, 'Classe D', 'Chimie', NULL, 'etudiant'),
	('9et', 'Moreau', 'Nathan', 's9@gmail.com', 'motdepassepqr', 2024, 'Classe E', 'Biologie', NULL, 'etudiant'),
	('ET001', 'El Mehdi', 'Karim', 'karim.elmehdi@example.com', '1111111', 2025, '2ème année', 'Génie Logiciel', NULL, 'etudiant'),
	('ET002', 'Fatima', 'Zahra', 'fatima.zahra@example.com', '2345', 2025, '2ème année', 'Génie Logiciel', NULL, 'etudiant'),
	('ET003', 'Omar', 'Benali', 'omar.benali@example.com', 'zzz44', 2024, '1ère année', 'Systèmes Embarqués', NULL, 'etudiant'),
	('ET004', 'Amina', 'Touhami', 'amina.touhami@example.com', '123321', 2024, '1ère année', 'Génie Informatique', NULL, 'etudiant'),
	('ET005', 'Yassine', 'Mouhoub', 'yassine.mouhoub@example.com', '1234567', 2023, '3ème année', 'Cybersécurité', NULL, 'etudiant'),
	('ET006', 'Nadia', 'El Hani', 'nadia.elhani@example.com', 'qwe4e', 2023, '3ème année', 'Intelligence Artificielle', NULL, 'etudiant'),
	('ET009', 'Benali', 'Yassine', 'yassine.benali@example.com', 'monmotdepasse', 2025, '2ème année', 'Génie Logiciel', NULL, 'etudiant'),
	('ET123', 'Dupont', 'Jean', 'jean.dupont@email.com', 'motdepasse', 2023, 'A1', 'Informatique', NULL, 'etudiant'),
	('ETD001', 'Martin', 'Alice', 'etudiant@est.com', '$2b$10$examplehash', 2023, 'GI3', 'Génie Informatique', 1, 'etudiant'),
	('ETD100', 'Doe', 'John', 'john.doe@est.com', 'etudiant123', 2023, 'GI3', 'Génie Informatique', NULL, 'etudiant'),
	('ETUD123', 'Dupont', 'Jean', 'etudiant@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrYV6znmCTM/33RWaHZQK6LQYfY8tQK', 2023, 'L3', 'Informatique', NULL, 'etudiant'),
	('etudiant123', 'Doe', 'John', 'john.doe@email.com', 'hashedpassword', 2023, 'ClasseA', 'Informatique', NULL, 'etudiant'),
	('etudiant124', 'louiass', 'salma', 'salma@gmail.com', 'hashcode', 2023, '2emeAnnee', 'gi', NULL, 'etudiant'),
	('student123', 'Doe', 'John', 'john.doe@example.com', 'hashedpassword', 2023, 'Class A', 'Computer Science', NULL, 'etudiant');

DROP TABLE IF EXISTS `fichierjoint`;
CREATE TABLE IF NOT EXISTS `fichierjoint` (
  `idFichier` int NOT NULL AUTO_INCREMENT,
  `nomFichier` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `cheminFichier` varchar(512) COLLATE utf8mb4_general_ci NOT NULL,
  `typeMIME` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `taille` int NOT NULL,
  `idMessage` int DEFAULT NULL,
  PRIMARY KEY (`idFichier`),
  KEY `idMessage` (`idMessage`),
  CONSTRAINT `fichierjoint_ibfk_1` FOREIGN KEY (`idMessage`) REFERENCES `message` (`idMessage`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `fichierjoint` (`idFichier`, `nomFichier`, `cheminFichier`, `typeMIME`, `taille`, `idMessage`) VALUES
	(9, 'Mener lâattaque MAC Flooding.pdf', '1743849685083-Mener lâattaque MAC Flooding.pdf', 'application/pdf', 1114056, 136);

DROP TABLE IF EXISTS `groupe`;
CREATE TABLE IF NOT EXISTS `groupe` (
  `idGroupe` int NOT NULL AUTO_INCREMENT,
  `nomGroupe` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `annee` int NOT NULL,
  `idTuteur` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idSujet` int DEFAULT NULL,
  PRIMARY KEY (`idGroupe`),
  KEY `idTuteur` (`idTuteur`),
  KEY `idSujet` (`idSujet`),
  CONSTRAINT `groupe_ibfk_1` FOREIGN KEY (`idTuteur`) REFERENCES `tuteur` (`idTuteur`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `groupe_ibfk_2` FOREIGN KEY (`idSujet`) REFERENCES `sujet` (`idSujet`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `groupe` (`idGroupe`, `nomGroupe`, `annee`, `idTuteur`, `idSujet`) VALUES
	(1, 'groupe1', 2025, 'T002', 1);

DROP TABLE IF EXISTS `livrable`;
CREATE TABLE IF NOT EXISTS `livrable` (
  `idLivrable` int NOT NULL AUTO_INCREMENT,
  `titre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `contenu` text COLLATE utf8mb4_general_ci,
  `version` int NOT NULL,
  `statut` enum('Soumis','Validé','Rejeté') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Soumis',
  `dateSoumission` date NOT NULL DEFAULT (curdate()),
  `type` enum('Documentation technique','Rapport','Présentation','Cahier des charges','Vidéo de démonstration','Article scientifique') COLLATE utf8mb4_general_ci NOT NULL,
  `idPfe` int NOT NULL,
  `idEtudiant` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `fichierUrl` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `commentaires` text COLLATE utf8mb4_general_ci,
  `idEncadrant` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idTuteur` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`idLivrable`),
  KEY `idPfe` (`idPfe`),
  KEY `idEtudiant` (`idEtudiant`),
  KEY `idEncadrant` (`idEncadrant`),
  KEY `idTuteur` (`idTuteur`),
  CONSTRAINT `livrable_ibfk_1` FOREIGN KEY (`idPfe`) REFERENCES `pfe` (`idPfe`) ON DELETE CASCADE,
  CONSTRAINT `livrable_ibfk_2` FOREIGN KEY (`idEtudiant`) REFERENCES `etudiant` (`idEtudiant`) ON DELETE CASCADE,
  CONSTRAINT `livrable_ibfk_3` FOREIGN KEY (`idEncadrant`) REFERENCES `encadrant` (`idEncadrant`) ON DELETE SET NULL,
  CONSTRAINT `livrable_ibfk_4` FOREIGN KEY (`idTuteur`) REFERENCES `tuteur` (`idTuteur`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `livrable` (`idLivrable`, `titre`, `contenu`, `version`, `statut`, `dateSoumission`, `type`, `idPfe`, `idEtudiant`, `fichierUrl`, `commentaires`, `idEncadrant`, `idTuteur`) VALUES
	(95, 'livrable1', 'livrable1 pour pfe', 1, 'Validé', '2025-04-05', 'Rapport', 1, 'etudiant124', '/uploads/1743848069689-1- Notion d\'entreprise  EST.pdf', '["tres bienqqq"]', NULL, NULL),
	(97, 'livrable3', 'livrable3pfe', 1, 'Validé', '2025-04-05', 'Documentation technique', 1, 'etudiant124', '/uploads/1743848213711-agrimaPr.pdf', NULL, NULL, NULL),
	(98, 'livrable4', 'livrable4pfe', 1, 'Rejeté', '2025-04-05', 'Vidéo de démonstration', 1, 'etudiant124', '/uploads/1743848554908-1- Notion d\'entreprise  EST.pdf', NULL, NULL, NULL),
	(108, 'test', 'test', 1, 'Validé', '2025-04-08', 'Documentation technique', 1, 'etudiant124', '/uploads/1744125553155-mes parties PFE.pdf', '["tres biien"]', NULL, NULL),
	(109, 'yfu', 'kvkbj', 1, 'Soumis', '2025-04-08', 'Rapport', 1, 'etudiant124', '/uploads/1744136811536-chapitre-4Agrima.pdf', NULL, NULL, NULL),
	(110, 'kjvkj', 'jbjnj', 1, 'Soumis', '2025-04-08', 'Rapport', 1, 'etudiant124', '/uploads/1744136827657-RAPPORT_TP1.pdf', NULL, NULL, NULL),
	(111, 'TESTDEV', 'test deee', 1, 'Validé', '2025-04-09', 'Rapport', 1, 'etudiant124', '/uploads/1744219003679-Anthropicâs Responsible Scaling Policy (version 2.1).pdf', NULL, NULL, NULL),
	(112, 'rapport Hicham', 'Hicham v 2', 1, 'Soumis', '2025-04-10', 'Rapport', 1, 'etudiant124', '/uploads/1744297796024-Anthropicâs Responsible Scaling Policy (version 2.1).pdf', NULL, NULL, NULL),
	(113, 'Test Hicham', 'sqfsqdfghsd', 1, 'Soumis', '2025-04-10', 'Rapport', 1, '1', '/uploads/1744297878128-Anthropicâs Responsible Scaling Policy (version 2.1).pdf', NULL, NULL, NULL),
	(114, 'Test hicham 2', 'presentation', 1, 'Soumis', '2025-04-10', 'Présentation', 1, '1', '/uploads/1744307472291-Anthropicâs Responsible Scaling Policy (version 2.1).pdf', NULL, NULL, NULL);

DROP TABLE IF EXISTS `login`;
CREATE TABLE IF NOT EXISTS `login` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('etudiant','tuteur','encadrant','responsableFiliere') COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `login` (`id`, `email`, `password`, `role`, `user_id`) VALUES
	(1, 'admin@est.ma', 'password', 'etudiant', '1'),
	(2, 's5@gmail.com', 'motdepassedef', 'etudiant', '5et'),
	(3, 's6@gmail.com', 'motdepasseghi', 'etudiant', '6et'),
	(4, 's7@gmail.com', 'motdepassejkl', 'etudiant', '7et'),
	(5, 's8@gmail.com', 'motdepassemno', 'etudiant', '8et'),
	(6, 's9@gmail.com', 'motdepassepqr', 'etudiant', '9et'),
	(7, 'karim.elmehdi@example.com', '1111111', 'etudiant', 'ET001'),
	(8, 'fatima.zahra@example.com', '2345', 'etudiant', 'ET002'),
	(9, 'omar.benali@example.com', 'zzz44', 'etudiant', 'ET003'),
	(10, 'amina.touhami@example.com', '123321', 'etudiant', 'ET004'),
	(11, 'yassine.mouhoub@example.com', '1234567', 'etudiant', 'ET005'),
	(12, 'nadia.elhani@example.com', 'qwe4e', 'etudiant', 'ET006'),
	(13, 'yassine.benali@example.com', 'monmotdepasse', 'etudiant', 'ET009'),
	(14, 'jean.dupont@email.com', 'motdepasse', 'etudiant', 'ET123'),
	(15, 'etudiant@est.com', '$2b$10$examplehash', 'etudiant', 'ETD001'),
	(16, 'john.doe@est.com', 'etudiant123', 'etudiant', 'ETD100'),
	(17, 'etudiant@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrYV6znmCTM/33RWaHZQK6LQYfY8tQK', 'etudiant', 'ETUD123'),
	(18, 'john.doe@email.com', 'hashedpassword', 'etudiant', 'etudiant123'),
	(19, 'salma@gmail.com', 'hashcode', 'etudiant', 'etudiant124'),
	(20, 'john.doe@example.com', 'hashedpassword', 'etudiant', 'student123'),
	(21, 'encadrant@est.ma', 'password', 'encadrant', '1'),
	(22, '', '', 'encadrant', 'ABC123'),
	(23, 'jean.dupont@example.com', 'rtyuioii', 'encadrant', 'E001'),
	(24, 'sophie.martin@example.com', 'j1eno1nrvo', 'encadrant', 'E002'),
	(25, 'luc.bernard@example.com', 'bwib', 'encadrant', 'E003'),
	(26, 'claire.morel@example.com', 'ffffggg', 'encadrant', 'E004'),
	(27, 'pierre.robert@example.com', 'iudbi2b', 'encadrant', 'E005'),
	(28, 'isabelle.durand@example.com', 'uhubcebib', 'encadrant', 'E006'),
	(29, 'encadrant@est.com', '$2b$10$examplehash', 'encadrant', 'ENC001'),
	(30, 'email@example.com', 'motdepasse', 'encadrant', 'ENC123'),
	(31, 'tuteur@est.ma', 'password', 'tuteur', '1'),
	(32, 'alice.smith@example.com', 'qwsaffe', 'tuteur', 'T002'),
	(33, 'tic.smith@example.com', '0987654', 'tuteur', 'T003'),
	(34, 'tuteur@est.com', '$2b$10$examplehash', 'tuteur', 'TUT001'),
	(35, 'sisi@gmail.com', '111122233', 'tuteur', 'tut12'),
	(36, 'uiwqbc@gmail.com', '12334908', 'tuteur', 'TUT34'),
	(37, 'responsable@est.ma', 'password', 'responsableFiliere', 'RESP001'),
	(38, 'admin@rg.com', 'password', 'etudiant', '10');

DROP TABLE IF EXISTS `meetingrequests`;
CREATE TABLE IF NOT EXISTS `meetingrequests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `idGroupe` int DEFAULT NULL,
  `sujet` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `agenda` text COLLATE utf8mb4_general_ci,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `studentId` (`studentId`),
  KEY `idGroupe` (`idGroupe`),
  CONSTRAINT `meetingrequests_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `etudiant` (`idEtudiant`),
  CONSTRAINT `meetingrequests_ibfk_2` FOREIGN KEY (`idGroupe`) REFERENCES `groupe` (`idGroupe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `message`;
CREATE TABLE IF NOT EXISTS `message` (
  `idMessage` int NOT NULL AUTO_INCREMENT,
  `contenu` text COLLATE utf8mb4_general_ci NOT NULL,
  `dateEnvoi` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `idDiscussion` int NOT NULL,
  `idEtudiant` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idTuteur` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idEncadrant` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idResponsableFiliere` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idMessageRepondu` int DEFAULT NULL,
  `aDesFichiers` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idMessage`),
  KEY `idDiscussion` (`idDiscussion`),
  KEY `idEtudiant` (`idEtudiant`),
  KEY `idTuteur` (`idTuteur`),
  KEY `idEncadrant` (`idEncadrant`),
  KEY `idResponsableFiliere` (`idResponsableFiliere`),
  KEY `idMessageRepondu` (`idMessageRepondu`),
  CONSTRAINT `message_ibfk_1` FOREIGN KEY (`idDiscussion`) REFERENCES `discussion` (`idDiscussion`) ON DELETE CASCADE,
  CONSTRAINT `message_ibfk_2` FOREIGN KEY (`idEtudiant`) REFERENCES `etudiant` (`idEtudiant`) ON DELETE SET NULL,
  CONSTRAINT `message_ibfk_3` FOREIGN KEY (`idTuteur`) REFERENCES `tuteur` (`idTuteur`) ON DELETE SET NULL,
  CONSTRAINT `message_ibfk_4` FOREIGN KEY (`idEncadrant`) REFERENCES `encadrant` (`idEncadrant`) ON DELETE SET NULL,
  CONSTRAINT `message_ibfk_5` FOREIGN KEY (`idResponsableFiliere`) REFERENCES `responsablefiliere` (`idResponsableFiliere`) ON DELETE SET NULL,
  CONSTRAINT `message_ibfk_6` FOREIGN KEY (`idMessageRepondu`) REFERENCES `message` (`idMessage`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `message` (`idMessage`, `contenu`, `dateEnvoi`, `idDiscussion`, `idEtudiant`, `idTuteur`, `idEncadrant`, `idResponsableFiliere`, `idMessageRepondu`, `aDesFichiers`) VALUES
	(112, 'hjvsakhsa', '2025-04-02 18:31:25', 24, 'ET123', NULL, NULL, NULL, NULL, 0),
	(113, 'hello how are you', '2025-04-02 18:32:46', 24, 'ET001', NULL, NULL, NULL, NULL, 0),
	(114, '>> @Karim: hello how are you\nchuuhuiue', '2025-04-02 18:34:08', 24, 'ET123', NULL, NULL, NULL, 113, 0),
	(115, 'cv', '2025-04-02 18:35:04', 24, NULL, 'T002', NULL, NULL, NULL, 0),
	(134, 'hi how are you', '2025-04-05 10:39:41', 34, NULL, 'T002', NULL, NULL, NULL, 0),
	(135, 'can you send me pdf', '2025-04-05 10:40:24', 34, NULL, 'T002', NULL, NULL, NULL, 0),
	(136, '>> @Alice: can you send me pdf\nyes take it😃', '2025-04-05 10:41:25', 34, 'ET123', NULL, NULL, NULL, 135, 1);

DROP TABLE IF EXISTS `notification`;
CREATE TABLE IF NOT EXISTS `notification` (
  `idNotification` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `content` text COLLATE utf8mb4_general_ci NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isRead` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idNotification`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `notification` (`idNotification`, `title`, `content`, `date`, `isRead`) VALUES
	(3, 'Nouvelle réunion: ksam', '\n            <p>Une nouvelle réunion a été planifiée:</p>\n            <p><strong>Sujet:</strong> ksam</p>\n            <p><strong>Date:</strong> 2025-04-01</p>\n            <p><strong>Heure:</strong> 18:28</p>\n            <p><strong>Agenda:</strong> xsha</p>\n          ', '2025-04-02 18:26:34', 0),
	(4, 'Nouvelle réunion: kkk', '\n            <p>Une nouvelle réunion a été planifiée:</p>\n            <p><strong>Sujet:</strong> kkk</p>\n            <p><strong>Date:</strong> 2025-03-28T00:00:00.000Z</p>\n            <p><strong>Heure:</strong> 10:56:00</p>\n            <p><strong>Agenda:</strong> gggg</p>\n          ', '2025-04-02 18:29:26', 0),
	(12, 'Nouvelle réunion: knlA', '\n            <p>Une nouvelle réunion a été planifiée:</p>\n            <p><strong>Sujet:</strong> knlA</p>\n            <p><strong>Date:</strong> 2025-04-15</p>\n            <p><strong>Heure:</strong> 23:16</p>\n            <p><strong>Agenda:</strong> ANLKnka</p>\n          ', '2025-04-02 21:16:56', 1);

DROP TABLE IF EXISTS `notificationrecipient`;
CREATE TABLE IF NOT EXISTS `notificationrecipient` (
  `idNotification` int NOT NULL,
  `recipientType` enum('etudiant','tuteur','encadrant','responsable') COLLATE utf8mb4_general_ci NOT NULL,
  `recipientId` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`idNotification`,`recipientType`,`recipientId`),
  CONSTRAINT `notificationrecipient_ibfk_1` FOREIGN KEY (`idNotification`) REFERENCES `notification` (`idNotification`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `notificationrecipient` (`idNotification`, `recipientType`, `recipientId`) VALUES
	(3, 'etudiant', '5et'),
	(3, 'etudiant', '6et'),
	(3, 'etudiant', 'ET002'),
	(3, 'etudiant', 'ET003'),
	(3, 'etudiant', 'ET004'),
	(4, 'etudiant', '5et'),
	(12, 'etudiant', '1'),
	(12, 'etudiant', '9et'),
	(12, 'etudiant', 'ET123');

DROP TABLE IF EXISTS `pfe`;
CREATE TABLE IF NOT EXISTS `pfe` (
  `idPfe` int NOT NULL AUTO_INCREMENT,
  `titre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `statut` enum('EnCours','EnRetard','Termine') COLLATE utf8mb4_general_ci NOT NULL,
  `dateDebut` date NOT NULL,
  `dateFin` date NOT NULL,
  PRIMARY KEY (`idPfe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `pfe` (`idPfe`, `titre`, `description`, `statut`, `dateDebut`, `dateFin`) VALUES
	(1, 'Projet Test', 'Description du projet test', 'EnCours', '2023-01-01', '2023-12-31');

DROP TABLE IF EXISTS `responsablefiliere`;
CREATE TABLE IF NOT EXISTS `responsablefiliere` (
  `idResponsableFiliere` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `nom` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `prenom` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `motDePasse` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `departement` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `annee` int NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'responsableFiliere',
  PRIMARY KEY (`idResponsableFiliere`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `responsablefiliere` (`idResponsableFiliere`, `nom`, `prenom`, `email`, `motDePasse`, `departement`, `annee`, `role`) VALUES
	('RESP001', 'Leroy', 'Pierre', 'responsable@est.com', '$2b$10$examplehash', 'Informatique', 2023, 'responsableFiliere');

DROP TABLE IF EXISTS `reunion`;
CREATE TABLE IF NOT EXISTS `reunion` (
  `idReunion` int NOT NULL AUTO_INCREMENT,
  `sujet` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `date` date NOT NULL,
  `heure` time NOT NULL,
  `idEtudiant` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idEncadrant` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idTuteur` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idResponsableFiliere` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `agenda` text COLLATE utf8mb4_general_ci,
  `createurType` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createurId` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`idReunion`),
  KEY `idEtudiant` (`idEtudiant`),
  KEY `idEncadrant` (`idEncadrant`),
  KEY `idTuteur` (`idTuteur`),
  KEY `idResponsableFiliere` (`idResponsableFiliere`),
  CONSTRAINT `reunion_ibfk_1` FOREIGN KEY (`idEtudiant`) REFERENCES `etudiant` (`idEtudiant`) ON DELETE SET NULL,
  CONSTRAINT `reunion_ibfk_2` FOREIGN KEY (`idEncadrant`) REFERENCES `encadrant` (`idEncadrant`) ON DELETE SET NULL,
  CONSTRAINT `reunion_ibfk_3` FOREIGN KEY (`idTuteur`) REFERENCES `tuteur` (`idTuteur`) ON DELETE SET NULL,
  CONSTRAINT `reunion_ibfk_4` FOREIGN KEY (`idResponsableFiliere`) REFERENCES `responsablefiliere` (`idResponsableFiliere`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `reunion` (`idReunion`, `sujet`, `date`, `heure`, `idEtudiant`, `idEncadrant`, `idTuteur`, `idResponsableFiliere`, `agenda`, `createurType`, `createurId`) VALUES
	(62, 'r12', '2025-04-08', '13:24:00', NULL, 'ENC123', NULL, NULL, 'reunion1', NULL, NULL),
	(63, 'r2', '2025-04-09', '02:30:00', NULL, 'ENC123', NULL, NULL, 'qhjb', NULL, NULL),
	(68, 'jbblbj', '2025-04-15', '22:16:00', NULL, 'ENC123', NULL, NULL, 'kvvkjvkv', NULL, NULL),
	(69, 'vhhv', '2025-04-16', '12:20:00', NULL, 'ENC123', NULL, NULL, 'jbkjkjb', NULL, NULL);

DROP TABLE IF EXISTS `reunionparticipant`;
CREATE TABLE IF NOT EXISTS `reunionparticipant` (
  `idReunion` int NOT NULL,
  `participantType` enum('etudiant','tuteur','encadrant') COLLATE utf8mb4_general_ci NOT NULL,
  `participantId` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`idReunion`,`participantType`,`participantId`),
  CONSTRAINT `reunionparticipant_ibfk_1` FOREIGN KEY (`idReunion`) REFERENCES `reunion` (`idReunion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `reunionparticipant` (`idReunion`, `participantType`, `participantId`) VALUES
	(62, 'etudiant', '5et'),
	(62, 'etudiant', 'etudiant124'),
	(62, 'tuteur', '1'),
	(62, 'tuteur', 'T003'),
	(62, 'encadrant', 'E006'),
	(63, 'etudiant', 'etudiant124'),
	(63, 'tuteur', '1'),
	(63, 'tuteur', 'T003'),
	(63, 'encadrant', 'E006'),
	(68, 'etudiant', '1'),
	(68, 'etudiant', '7et'),
	(68, 'etudiant', '9et'),
	(68, 'etudiant', 'ET002'),
	(69, 'etudiant', '5et'),
	(69, 'etudiant', '8et'),
	(69, 'etudiant', 'ET004');

DROP TABLE IF EXISTS `suivipfe`;
CREATE TABLE IF NOT EXISTS `suivipfe` (
  `idSuivi` int NOT NULL AUTO_INCREMENT,
  `dateSuivi` date NOT NULL,
  `nom` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `prenom` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `note` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `etatAvancement` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `pointsBloquants` text COLLATE utf8mb4_general_ci,
  `idTuteur` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idEncadrant` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idEtudiant` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`idSuivi`),
  KEY `idTuteur` (`idTuteur`),
  KEY `idEncadrant` (`idEncadrant`),
  KEY `idEtudiant` (`idEtudiant`),
  CONSTRAINT `suivipfe_ibfk_1` FOREIGN KEY (`idTuteur`) REFERENCES `tuteur` (`idTuteur`) ON DELETE CASCADE,
  CONSTRAINT `suivipfe_ibfk_2` FOREIGN KEY (`idEncadrant`) REFERENCES `encadrant` (`idEncadrant`) ON DELETE SET NULL,
  CONSTRAINT `suivipfe_ibfk_3` FOREIGN KEY (`idEtudiant`) REFERENCES `etudiant` (`idEtudiant`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `suivipfe` (`idSuivi`, `dateSuivi`, `nom`, `prenom`, `note`, `etatAvancement`, `pointsBloquants`, `idTuteur`, `idEncadrant`, `idEtudiant`) VALUES
	(15, '2025-03-19', 'louiass', 'salma', '17', 'page discussion', 'errors addition de message', 'T003', NULL, NULL),
	(16, '2025-04-16', 'hhh', 'vgv', '16', 'yuiu', 'u', NULL, NULL, NULL),
	(18, '2025-04-13', 'mstari', 'hiba', '15', 'page de discussions', 'pas de points bloquentes', NULL, NULL, NULL),
	(20, '2025-04-24', 'test', 'test', '17', 'uwq', 'wqbi', NULL, NULL, NULL);

DROP TABLE IF EXISTS `sujet`;
CREATE TABLE IF NOT EXISTS `sujet` (
  `idSujet` int NOT NULL AUTO_INCREMENT,
  `titre` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`idSujet`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `sujet` (`idSujet`, `titre`) VALUES
	(1, 'sujet1');

DROP TABLE IF EXISTS `tuteur`;
CREATE TABLE IF NOT EXISTS `tuteur` (
  `idTuteur` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `nom` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `prenom` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `motDePasse` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `annee` int NOT NULL,
  `classe` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `filiere` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'tuteur',
  PRIMARY KEY (`idTuteur`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tuteur` (`idTuteur`, `nom`, `prenom`, `email`, `motDePasse`, `annee`, `classe`, `filiere`, `role`) VALUES
	('1', 'Jane', 'Smith', 'jane@gmail.com', 'password123', 2023, 'ClassA', 'Computer Science', 'tuteur'),
	('T002', 'Smith', 'Alice', 'alice.smith@example.com', 'qwsaffe', 2025, '2ème année', 'Génie Logiciel', 'tuteur'),
	('T003', 'soso', 'tut', 'tic.smith@example.com', '0987654', 2025, '2ème année', 'GP', 'tuteur'),
	('TUT001', 'Dupont', 'Jean', 'tuteur@est.com', '$2b$10$examplehash', 2023, 'GI3', 'Génie Informatique', 'tuteur'),
	('tut12', 'sso', 'siis', 'sisi@gmail.com', '111122233', 2025, 'class1', 'gi', 'tuteur'),
	('TUT34', 'iwqu', 'ji', 'uiwqbc@gmail.com', '12334908', 2025, 'classe3', 'gp', 'tuteur');

DROP TRIGGER IF EXISTS `after_delete_encadrant`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `after_delete_encadrant` AFTER DELETE ON `encadrant` FOR EACH ROW BEGIN
    DELETE FROM Login WHERE user_id = OLD.idEncadrant AND role = 'encadrant';
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

DROP TRIGGER IF EXISTS `after_delete_etudiant`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `after_delete_etudiant` AFTER DELETE ON `etudiant` FOR EACH ROW BEGIN
    DELETE FROM Login WHERE user_id = OLD.idEtudiant AND role = 'etudiant';
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

DROP TRIGGER IF EXISTS `after_delete_responsable`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `after_delete_responsable` AFTER DELETE ON `responsablefiliere` FOR EACH ROW BEGIN
    DELETE FROM Login WHERE user_id = OLD.idResponsableFiliere AND role = 'responsableFiliere';
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

DROP TRIGGER IF EXISTS `after_delete_tuteur`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `after_delete_tuteur` AFTER DELETE ON `tuteur` FOR EACH ROW BEGIN
    DELETE FROM Login WHERE user_id = OLD.idTuteur AND role = 'tuteur';
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

DROP TRIGGER IF EXISTS `after_insert_encadrant`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `after_insert_encadrant` AFTER INSERT ON `encadrant` FOR EACH ROW BEGIN
    INSERT INTO Login (user_id, email, password, role) 
    VALUES (NEW.idEncadrant, NEW.email, NEW.motDePasse, 'encadrant');
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

DROP TRIGGER IF EXISTS `after_insert_etudiant`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `after_insert_etudiant` AFTER INSERT ON `etudiant` FOR EACH ROW BEGIN
    INSERT INTO Login (user_id, email, password, role) 
    VALUES (NEW.idEtudiant, NEW.email, NEW.motDePasse, 'etudiant');
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

DROP TRIGGER IF EXISTS `after_insert_responsable`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `after_insert_responsable` AFTER INSERT ON `responsablefiliere` FOR EACH ROW BEGIN
    INSERT INTO Login (user_id, email, password, role) 
    VALUES (NEW.idResponsableFiliere, NEW.email, NEW.motDePasse, 'responsableFiliere');
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

DROP TRIGGER IF EXISTS `after_insert_tuteur`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `after_insert_tuteur` AFTER INSERT ON `tuteur` FOR EACH ROW BEGIN
    INSERT INTO Login (user_id, email, password, role) 
    VALUES (NEW.idTuteur, NEW.email, NEW.motDePasse, 'tuteur');
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

DROP VIEW IF EXISTS `allparticipants`;
DROP TABLE IF EXISTS `allparticipants`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `allparticipants` AS select 'etudiant' AS `type`,`etudiant`.`idEtudiant` AS `id`,concat(`etudiant`.`nom`,' ',`etudiant`.`prenom`) AS `name` from `etudiant` union all select 'tuteur' AS `type`,`tuteur`.`idTuteur` AS `id`,concat(`tuteur`.`nom`,' ',`tuteur`.`prenom`) AS `name` from `tuteur` union all select 'encadrant' AS `type`,`encadrant`.`idEncadrant` AS `id`,concat(`encadrant`.`nom`,' ',`encadrant`.`prenom`) AS `name` from `encadrant`;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
