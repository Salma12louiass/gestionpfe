// MON-PROJET/app/professeur-tuteur-livrables/page.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { Search, Check, X, MessageSquare, Eye, ChevronDown, Download } from "lucide-react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

export default function ProfesseurTuteurPage() {
  const [livrables, setLivrables] = useState([]);
  const [selectedLivrable, setSelectedLivrable] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showActionMenuId, setShowActionMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const actionMenuRef = useRef(null);

  // Récupérer les livrables depuis l'API
  useEffect(() => {
    const fetchLivrables = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/livrables");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des livrables");
        }
        const data = await response.json();
        setLivrables(data);
      } catch (error) {
        console.error("Erreur:", error);
        alert("Échec de la récupération des livrables");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLivrables();
  }, []);

  // Gérer la validation ou le rejet d'un livrable
  const handleValidation = async (idLivrable, statut) => {
    try {
      const response = await fetch(`http://localhost:5000/api/livrables/${idLivrable}/statut`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ statut }),
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour du statut");
      }

      setLivrables(prevLivrables =>
        prevLivrables.map(livrable =>
          livrable.idLivrable === idLivrable ? { ...livrable, statut } : livrable
        )
      );

      alert(`Livrable ${statut.toLowerCase()} avec succès !`);
      setShowActionMenuId(null);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Échec de la mise à jour du statut");
    }
  };

  // Gérer l'ajout d'un commentaire
  const handleCommentaire = async (idLivrable) => {
    if (commentaire.trim() === "") {
      alert("Veuillez entrer un commentaire.");
      return;
    }
  
    try {
      const response = await fetch(
        `http://localhost:5000/api/livrables/${idLivrable}/commentaires`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ commentaire }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Échec de l'ajout du commentaire");
      }
  
      const data = await response.json();
  
      setLivrables(prevLivrables =>
        prevLivrables.map(livrable =>
          livrable.idLivrable === idLivrable
            ? { ...livrable, commentaires: data.commentaires }
            : livrable
        )
      );
  
      setCommentaire("");
      alert("Commentaire ajouté avec succès !");
      setShowCommentModal(false);
      setShowActionMenuId(null);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Échec de l'ajout du commentaire");
    }
  };

  // Gérer le téléchargement du fichier
  const handleDownload = () => {
    if (selectedLivrable && selectedLivrable.fichierUrl) {
      const a = document.createElement("a");
      a.href = `http://localhost:5000${selectedLivrable.fichierUrl}`;
      a.download = selectedLivrable.titre;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("Fichier non trouvé !");
    }
  };

  // Ouvrir la modal de visualisation
  const openViewModal = (livrable) => {
    setSelectedLivrable(livrable);
    setShowViewModal(true);
    setShowActionMenuId(null);
  };

  // Ouvrir la modal de commentaire
  const openCommentModal = (livrable) => {
    setSelectedLivrable(livrable);
    setShowCommentModal(true);
    setShowActionMenuId(null);
  };

  // Fermer toutes les modales
  const closeModals = () => {
    setShowViewModal(false);
    setShowCommentModal(false);
    setSelectedLivrable(null);
  };

  // Basculer le menu d'actions
  const toggleActionMenu = (id, e) => {
    e.stopPropagation();
    setShowActionMenuId(showActionMenuId === id ? null : id);
  };

  // Filtrer les livrables en fonction de la recherche
  const filteredLivrables = livrables.filter((livrable) =>
    livrable.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    livrable.idEtudiant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Gérer les clics en dehors du menu d'actions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setShowActionMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Formater la date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Nettoyer les commentaires
  const cleanComments = (comments) => {
    if (!comments) return "Aucun commentaire";
    if (Array.isArray(comments)) {
      return comments.map(comment => 
        typeof comment === 'string' ? comment.replace(/^"|"$/g, '') : String(comment)
      ).join(", ");
    }
    return String(comments).replace(/^\[|\]$/g, '').replace(/"/g, '');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <nav className="bg-white shadow-md p-4 rounded-lg mb-6 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800 flex-grow text-center mx-4 dark:text-white">
                  📁 Livrables Soumis par les Étudiants
                </h1>
              </div>
            </nav>

            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Rechercher par titre ou étudiant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b17a56] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b17a56]"></div>
              </div>
            ) : filteredLivrables.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center dark:bg-gray-800">
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? "Aucun résultat trouvé pour votre recherche." : "Aucun livrable disponible pour le moment."}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden dark:bg-gray-800">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 sticky top-0 z-10 dark:bg-gray-700">
                      <tr>
                        <th className="p-4 text-left text-gray-700 dark:text-white">Titre</th>
                        <th className="p-4 text-left text-gray-700 dark:text-white">Étudiant</th>
                        <th className="p-4 text-left text-gray-700 dark:text-white">Date de soumission</th>
                        <th className="p-4 text-left text-gray-700 dark:text-white">Version</th>
                        <th className="p-4 text-left text-gray-700 dark:text-white">Statut</th>
                        <th className="p-4 text-center text-gray-700 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredLivrables.map((livrable) => (
                        <tr
                          key={livrable.idLivrable}
                          className="hover:bg-gray-50 transition dark:hover:bg-gray-700"
                        >
                          <td className="p-4 text-gray-800 dark:text-white font-medium">{livrable.titre}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-400">{livrable.idEtudiant}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-400">{formatDate(livrable.dateSoumission)}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-400">v{livrable.version}</td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                livrable.statut === "Validé"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : livrable.statut === "Rejeté"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}
                            >
                              {livrable.statut}
                            </span>
                          </td>
                          <td className="p-4 text-center relative">
                            <div className="relative inline-block">
                              <button
                                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                onClick={(e) => toggleActionMenu(livrable.idLivrable, e)}
                              >
                                <span>Actions</span>
                                <ChevronDown size={16} className={`transition-transform ${showActionMenuId === livrable.idLivrable ? 'rotate-180' : ''}`} />
                              </button>
                              {showActionMenuId === livrable.idLivrable && (
                                <div
                                  ref={actionMenuRef}
                                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 dark:bg-gray-800 dark:border-gray-700"
                                >
                                  <button
                                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition dark:text-white dark:hover:bg-gray-700"
                                    onClick={() => openViewModal(livrable)}
                                  >
                                    <Eye size={16} />
                                    <span>Voir</span>
                                  </button>
                                  <button
                                    className="w-full flex items-center gap-2 px-4 py-2 text-green-700 hover:bg-green-100 transition dark:text-green-400 dark:hover:bg-green-900"
                                    onClick={() => handleValidation(livrable.idLivrable, "Validé")}
                                  >
                                    <Check size={16} />
                                    <span>Valider</span>
                                  </button>
                                  <button
                                    className="w-full flex items-center gap-2 px-4 py-2 text-red-700 hover:bg-red-100 transition dark:text-red-400 dark:hover:bg-red-900"
                                    onClick={() => handleValidation(livrable.idLivrable, "Rejeté")}
                                  >
                                    <X size={16} />
                                    <span>Rejeter</span>
                                  </button>
                                  <button
                                    className="w-full flex items-center gap-2 px-4 py-2 text-[#b17a56] hover:bg-[#b17a56]/10 transition dark:text-[#b17a56] dark:hover:bg-[#b17a56]/20"
                                    onClick={() => openCommentModal(livrable)}
                                  >
                                    <MessageSquare size={16} />
                                    <span>Commenter</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {showViewModal && selectedLivrable && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative dark:bg-gray-800">
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={closeModals}
                  >
                    <X size={24} />
                  </button>

                  <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">
                    📂 {selectedLivrable.titre}
                  </h2>
                  <div className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Étudiant:</span> {selectedLivrable.idEtudiant}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Date de soumission:</span> {formatDate(selectedLivrable.dateSoumission)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Version:</span> v{selectedLivrable.version}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Statut:</span>{" "}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedLivrable.statut === "Validé"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : selectedLivrable.statut === "Rejeté"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}>
                        {selectedLivrable.statut}
                      </span>
                    </p>
                    <div className="pt-2">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Commentaires:</span> {cleanComments(selectedLivrable.commentaires)}
                      </p>
                    </div>
                  </div>
                  <button
                    className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-[#b17a56] text-white rounded-lg hover:bg-[#b17a56]/90 transition dark:bg-[#b17a56] dark:hover:bg-[#b17a56]/80"
                    onClick={handleDownload}
                  >
                    <Download size={18} />
                    <span>Télécharger le fichier</span>
                  </button>
                </div>
              </div>
            )}

            {showCommentModal && selectedLivrable && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative dark:bg-gray-800">
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={closeModals}
                  >
                    <X size={24} />
                  </button>

                  <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">
                    💬 Ajouter un commentaire
                  </h2>
                  <p className="text-gray-600 mb-4 dark:text-gray-400">
                    Pour: <span className="font-semibold">{selectedLivrable.titre}</span>
                  </p>
                  <div className="mb-4">
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b17a56] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows="4"
                      placeholder="Entrez votre commentaire ici..."
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                    />
                  </div>
                  <button
                    className="w-full px-4 py-2 bg-[#b17a56] text-white rounded-lg hover:bg-[#b17a56]/90 transition dark:bg-[#b17a56] dark:hover:bg-[#b17a56]/80"
                    onClick={() => handleCommentaire(selectedLivrable.idLivrable)}
                  >
                    Envoyer le commentaire
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}