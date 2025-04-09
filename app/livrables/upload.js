// app/livrables/upload.js
"use client";
import { useState } from "react";
import { Upload, X } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

export default function UploadLivrable({ onCancel, onUpload }) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [titre, setTitre] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError("");
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    if (selectedFile.type !== "application/pdf") {
      setFileError("Seuls les fichiers PDF sont autorisés.");
      setFile(null);
      e.target.value = null; // Réinitialiser l'input
    } else {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs
    if (!titre.trim()) {
      alert("Le titre est requis.");
      return;
    }
    if (!type) {
      alert("Veuillez sélectionner un type de livrable.");
      return;
    }
    if (!description.trim()) {
      alert("La description est requise.");
      return;
    }
    if (!file) {
      alert("Veuillez sélectionner un fichier PDF.");
      return;
    }

    // Vérifier que l'utilisateur est connecté et est un étudiant
    if (!user || user.role !== 'etudiant') {
      alert("Vous devez être connecté en tant qu'étudiant pour soumettre un livrable.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("titre", titre.trim());
    formData.append("contenu", description.trim());
    formData.append("version", 1);
    formData.append("statut", "Soumis"); // Statut par défaut
    formData.append("dateSoumission", new Date().toISOString().split("T")[0]);
    formData.append("type", type);
    formData.append("idPfe", 1); // Valeur par défaut - à ajuster selon vos besoins
    formData.append("idEtudiant", user.id); // Utiliser l'ID de l'étudiant connecté
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/livrables", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Une erreur s'est produite" }));
        throw new Error(errorData.message || "Échec de la soumission du livrable");
      }

      const data = await response.json();
      
      // Construction de l'objet livrable à ajouter à l'état local
      const newLivrable = {
        idLivrable: data.idLivrable || Date.now(), // Fallback si l'API ne renvoie pas d'ID
        titre: titre.trim(),
        contenu: description.trim(),
        version: 1,
        statut: "Soumis",
        dateSoumission: new Date().toISOString().split("T")[0],
        type: type,
        idPfe: 1,
        idEtudiant: user.id,
        fichierUrl: data.fichierUrl || `/uploads/${file.name}`, // Fallback si l'API ne renvoie pas d'URL
      };
      
      // Appeler la fonction de rappel pour mettre à jour l'état parent
      onUpload(newLivrable);

      // Réinitialisation du formulaire
      setTitre("");
      setType("");
      setFile(null);
      setDescription("");
      setIsSubmitting(false);
      
    } catch (error) {
      console.error("Erreur lors de la soumission du livrable:", error);
      alert(`Échec de la soumission du livrable: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">📤 Soumettre un livrable</h1>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1 dark:text-gray-300">📝 Titre :</label>
          <input
            type="text"
            placeholder="Entrez le titre du livrable"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="border border-gray-300 p-1.5 text-sm w-full bg-white text-gray-800 rounded-md focus:outline-none focus:border-[#b17a56] focus:ring-1 focus:ring-[#b17a56] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1 dark:text-gray-300">📄 Type :</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 p-1.5 text-sm w-full bg-white text-gray-800 rounded-md focus:outline-none focus:border-[#b17a56] focus:ring-1 focus:ring-[#b17a56] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            disabled={isSubmitting}
          >
            <option value="" disabled>Sélectionnez un type</option>
            <option value="Rapport">Rapport</option>
            <option value="Présentation">Présentation</option>
            <option value="Cahier des charges">Cahier des charges</option>
            <option value="Documentation technique">Documentation technique</option>
            <option value="Article scientifique">Article scientifique</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1 dark:text-gray-300">📂 Fichier (PDF) :</label>
          <div className="border border-gray-300 p-1.5 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600">
            <input
              type="file"
              onChange={handleFileChange}
              accept="application/pdf"
              className="w-full text-sm text-gray-800 dark:text-white"
              required
              disabled={isSubmitting}
            />
          </div>
          {fileError && <p className="text-red-500 text-xs mt-1">{fileError}</p>}
          {file && (
            <p className="text-green-600 text-xs mt-1 dark:text-green-400">
              Fichier sélectionné: {file.name}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1 dark:text-gray-300">📝 Description :</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 p-1.5 text-sm w-full bg-white text-gray-800 rounded-md focus:outline-none focus:border-[#b17a56] focus:ring-1 focus:ring-[#b17a56] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows="3"
            required
            disabled={isSubmitting}
            placeholder="Décrivez votre livrable..."
          ></textarea>
        </div>
        
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-[#b17a56] text-white rounded-md hover:bg-[#b17a56]/90 transition-all dark:bg-[#b17a56] dark:hover:bg-[#b17a56]/80"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Soumission...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Soumettre</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}