// MON-PROJET/app/professeur-tuteur-livrables/page.jsx
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
  const [visibleRows, setVisibleRows] = useState({});
  
  const actionMenuRef = useRef(null);
  const tableBodyRef = useRef(null);
  const tableRef = useRef(null);

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
        
        // Initialiser tous les livrables comme visibles par défaut
        const initialVisibility = {};
        data.forEach(livrable => {
          initialVisibility[livrable.idLivrable] = true;
        });
        setVisibleRows(initialVisibility);
      } catch (error) {
        console.error("Erreur:", error);
        alert("Échec de la récupération des livrables");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLivrables();
  }, []);
  
  // Setup scroll observer for table rows
  useEffect(() => {
    if (!tableBodyRef.current) return;
    
    const handleScroll = () => {
      if (!tableRef.current) return;
      
      const tableRect = tableRef.current.getBoundingClientRect();
      const rowElements = tableBodyRef.current.querySelectorAll('tr');
      
      const newVisibility = {...visibleRows};
      
      rowElements.forEach(row => {
        const rowRect = row.getBoundingClientRect();
        const rowId = row.dataset.id;
        
        // Check if row is in viewport with buffer area
        const buffer = 100; // Buffer zone in pixels
        const isVisible = (
          rowRect.top < (window.innerHeight + buffer) &&
          rowRect.bottom > (0 - buffer) &&
          rowRect.top > (tableRect.top - buffer) &&
          rowRect.bottom < (tableRect.bottom + buffer)
        );
        
        newVisibility[rowId] = isVisible;
      });
      
      setVisibleRows(newVisibility);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    setTimeout(handleScroll, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [livrables]);

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

      // Mettre à jour l'état local
      setLivrables((prevLivrables) =>
        prevLivrables.map((livrable) =>
          livrable.idLivrable === idLivrable ? { ...livrable, statut } : livrable
        )
      );

      alert(`Livrable ${statut.toLowerCase()} avec succès !`);
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
  
      // Mettre à jour l'état local
      setLivrables((prevLivrables) =>
        prevLivrables.map((livrable) =>
          livrable.idLivrable === idLivrable
            ? { ...livrable, commentaires: data.commentaires }
            : livrable
        )
      );
  
      setCommentaire("");
      alert("Commentaire ajouté avec succès !");
      setShowCommentModal(false);
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
      a.download = selectedLivrable.titre; // Nom du fichier à télécharger
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      alert(`Téléchargement du fichier "${selectedLivrable.titre}" réussi !`);
    } else {
      alert("Fichier non trouvé !");
    }
  };

  // Ouvrir la modal de visualisation
  const openViewModal = (livrable) => {
    setSelectedLivrable(livrable);
    setShowViewModal(true);
  };

  // Ouvrir la modal de commentaire
  const openCommentModal = (livrable) => {
    setSelectedLivrable(livrable);
    setShowCommentModal(true);
  };

  // Fermer toutes les modales
  const closeModals = () => {
    setShowViewModal(false);
    setShowCommentModal(false);
    setSelectedLivrable(null);
  };

  // Basculer le menu d'actions
  const toggleActionMenu = (id) => {
    setShowActionMenuId(showActionMenuId === id ? null : id);
  };

  // Filtrer les livrables en fonction de la recherche
  const filteredLivrables = livrables.filter((livrable) =>
    livrable.titre.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      <div className="w-full">
        {/* Navbar */}
        <Navbar />

        {/* Contenu Principal */}
        <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen dark:bg-gray-900">
          {/* Barre de navigation */}
          <nav className="bg-white shadow-md p-4 rounded-lg mb-6 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800 flex-grow text-center mx-4 dark:text-white">
                📁 Livrables Soumis par les Étudiants
              </h1>
            </div>
          </nav>

          {/* Barre de recherche */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#b17a56] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          {/* Tableau des livrables */}
          {isLoading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">Chargement en cours...</p>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden dark:bg-gray-800" style={{ height: "60vh", overflowY: "auto" }} ref={tableRef}>
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
                <tbody ref={tableBodyRef}>
                  {filteredLivrables.map((livrable) => (
                    <tr
                      key={livrable.idLivrable}
                      data-id={livrable.idLivrable}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition dark:hover:bg-gray-700 ${
                        visibleRows[livrable.idLivrable] ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                      style={{ 
                        transition: "opacity 0.3s, transform 0.3s",
                        transform: visibleRows[livrable.idLivrable] ? "translateY(0)" : "translateY(20px)" 
                      }}
                    >
                      <td className="p-4 text-gray-800 dark:text-white">{livrable.titre}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{livrable.idEtudiant}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{livrable.dateSoumission}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">v{livrable.version}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            livrable.statut === "Validé"
                              ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                              : livrable.statut === "Rejeté"
                              ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200"
                          }`}
                        >
                          {livrable.statut}
                        </span>
                      </td>
                      <td className="p-4 text-center relative">
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                          onClick={() => toggleActionMenu(livrable.idLivrable)}
                        >
                          <span>Action</span>
                          <ChevronDown size={16} />
                        </button>
                        {showActionMenuId === livrable.idLivrable && (
                          <div
                            ref={actionMenuRef}
                            className="absolute right-4 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 dark:bg-gray-800 dark:border-gray-700"
                          >
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition dark:text-white dark:hover:bg-gray-700"
                              onClick={() => openViewModal(livrable)}
                            >
                              <Eye size={16} />
                              <span>Voir</span>
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 text-green-700 hover:bg-green-100 transition dark:text-green-400 dark:hover:bg-green-800"
                              onClick={() => handleValidation(livrable.idLivrable, "Validé")}
                            >
                              <Check size={16} />
                              <span>Valider</span>
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 text-red-700 hover:bg-red-100 transition dark:text-red-400 dark:hover:bg-red-800"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal pour voir les détails et télécharger */}
          {showViewModal && selectedLivrable && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative dark:bg-gray-800">
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={closeModals}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">
                  📂 {selectedLivrable.titre}
                </h2>
                <p className="text-gray-600 mb-2 dark:text-gray-400">👤 <b>Étudiant :</b> {selectedLivrable.idEtudiant}</p>
                <p className="text-gray-600 mb-2 dark:text-gray-400">🗓️ <b>Date de soumission :</b> {selectedLivrable.dateSoumission}</p>
                <p className="text-gray-600 mb-2 dark:text-gray-400">📝 <b>Version :</b> v{selectedLivrable.version}</p>
                <p className="text-gray-600 mb-2 dark:text-gray-400">🏷️ <b>Statut :</b> {selectedLivrable.statut}</p>
                <p className="text-gray-600 mb-4 dark:text-gray-400">
                  💬 <b>Commentaires :</b> {
                    selectedLivrable.commentaires 
                      ? Array.isArray(selectedLivrable.commentaires)
                        ? selectedLivrable.commentaires.map(comment => comment.replace(/^"|"$/g, '')).join(", ")
                        : selectedLivrable.commentaires.toString().replace(/^\[|\]$/g, '').replace(/"/g, '')
                      : "Aucun commentaire"
                  }
                </p>
                {/* Bouton Télécharger dans la modal */}
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#b17a56] text-white rounded-lg hover:bg-[#b17a56]/90 transition dark:bg-[#b17a56] dark:hover:bg-[#b17a56]/80"
                  onClick={handleDownload}
                >
                  <Download size={18} />
                  <span>Télécharger le fichier</span>
                </button>
              </div>
            </div>
          )}

          {/* Modal pour ajouter un commentaire */}
          {showCommentModal && selectedLivrable && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative dark:bg-gray-800">
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={closeModals}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">
                  💬 Ajouter un commentaire pour {selectedLivrable.titre}
                </h2>
                <div className="mb-4">
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#b17a56] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows="4"
                    placeholder="Entrez votre commentaire..."
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                  />
                </div>
                <button
                  className="w-full px-4 py-2 bg-[#b17a56] text-white rounded-lg hover:bg-[#b17a56]/90 transition dark:bg-[#b17a56] dark:hover:bg-[#b17a56]/80"
                  onClick={() => handleCommentaire(selectedLivrable.idLivrable)}
                >
                  Ajouter un commentaire
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}