// app/livrables/page.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Search, Trash, Edit, Eye, ChevronDown, Download } from "lucide-react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import UploadLivrable from "./upload";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";

const StatutLivrable = {
  Soumis: "Soumis",
  Validé: "Validé",
  Rejeté: "Rejeté",
};

const TypesLivrable = {
  DocumentationTechnique: "Documentation technique",
  Rapport: "Rapport",
  Presentation: "Présentation",
  CahierDesCharges: "Cahier des charges",
  ArticleScientifique: "Article scientifique",
};

const LivrablesContent = () => {
  const { user } = useAuth();
  const [livrables, setLivrables] = useState([]);
  const [selectedLivrable, setSelectedLivrable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMenuId, setActionMenuId] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [livrableToDelete, setLivrableToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleLivrables, setVisibleLivrables] = useState({});

  const actionMenuRef = useRef(null);
  const observerRefs = useRef({});
  const tableRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const fetchLivrables = async () => {
    setIsLoading(true);
    try {
      // Si l'utilisateur est un étudiant, récupérer seulement ses livrables
      const endpoint = user?.role === 'etudiant' 
        ? `http://localhost:5000/api/livrables/etudiant/${user.id}`
        : "http://localhost:5000/api/livrables";
        
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
      }
      const data = await response.json();
      setLivrables(data);
      
      // Initialiser tous les livrables comme visibles au départ
      const initialVisibility = {};
      data.forEach(livrable => {
        initialVisibility[livrable.idLivrable] = true;
      });
      setVisibleLivrables(initialVisibility);
    } catch (error) {
      console.error("Erreur lors de la récupération des livrables:", error);
      alert("Échec de la récupération des livrables. Veuillez vérifier le serveur backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLivrables();
    }
  }, [user]);

  const handleDelete = async (idLivrable) => {
    try {
      const response = await fetch(`http://localhost:5000/api/livrables/${idLivrable}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Échec de la suppression du livrable");
      }

      // Mettre à jour l'état local immédiatement
      setLivrables((prevLivrables) =>
        prevLivrables.filter((livrable) => livrable.idLivrable !== idLivrable)
      );

      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error("Erreur lors de la suppression du livrable:", error.message);
      alert("Échec de la suppression du livrable.");
    }
  };

  const handleEdit = async (idLivrable, updatedData) => {
    try {
      // Vérifier si le livrable est déjà validé
      const livrable = livrables.find(l => l.idLivrable === idLivrable);
      if (livrable && livrable.statut === StatutLivrable.Validé) {
        alert("Impossible de modifier un livrable déjà validé.");
        return;
      }

      const formData = new FormData();
      for (const key in updatedData) {
        if (updatedData[key] !== undefined) {
          formData.append(key, updatedData[key]);
        }
      }

      const response = await fetch(`http://localhost:5000/api/livrables/${idLivrable}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour du livrable");
      }

      const result = await response.json();

      // Mettre à jour l'état local immédiatement
      setLivrables((prevLivrables) =>
        prevLivrables.map((livrable) =>
          livrable.idLivrable === idLivrable 
            ? { 
                ...livrable, 
                ...updatedData,
                version: result.newVersion || livrable.version,
                statut: "Soumis"
              } 
            : livrable
        )
      );

      setShowEditModal(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du livrable:", error.message);
      alert("Échec de la mise à jour du livrable.");
    }
  };

  const handleValidation = async (idLivrable, statut) => {
    // Uniquement accessible aux tuteurs et encadrants
    if (user.role !== 'tuteur' && user.role !== 'encadrant' && user.role !== 'responsableFiliere') {
      alert("Vous n'avez pas les droits pour valider ou rejeter un livrable.");
      return;
    }

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

  const handleDownload = (livrable) => {
    if (!livrable.fichierUrl) {
      alert("Fichier non trouvé !");
      return;
    }
    
    try {
      const a = document.createElement("a");
      a.href = `http://localhost:5000${livrable.fichierUrl}`;
      a.download = livrable.titre;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      alert("Échec du téléchargement du fichier.");
    }
  };

  const closeAllModals = () => {
    setShowModal(false);
    setShowUploadModal(false);
    setShowEditModal(false);
    setShowDeleteConfirmation(false);
  };

  const toggleActionMenu = (idLivrable) => {
    setActionMenuId(actionMenuId === idLivrable ? null : idLivrable);
  };

  const handleAddLivrable = (newLivrable) => {
    // Mettre à jour l'état local immédiatement
    setLivrables((prevLivrables) => [...prevLivrables, newLivrable]);
    setShowUploadModal(false);
    
    // Initialiser le nouveau livrable comme visible
    setVisibleLivrables(prev => ({
      ...prev,
      [newLivrable.idLivrable]: true
    }));
  };

  // Filtrer les livrables en fonction de la recherche
  const filteredLivrables = livrables.filter((livrable) =>
    livrable.titre.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Initialiser les références pour chaque ligne du tableau
  useEffect(() => {
    // Créer des refs pour tous les livrables filtrés
    filteredLivrables.forEach(livrable => {
      if (!observerRefs.current[livrable.idLivrable]) {
        observerRefs.current[livrable.idLivrable] = React.createRef();
      }
    });
  }, [filteredLivrables]);

  // Configurer l'Intersection Observer pour chaque ligne de tableau
  useEffect(() => {
    const options = {
      root: null, // Utilisez le viewport comme conteneur de référence
      rootMargin: "0px", // Marge autour du viewport
      threshold: 0.1 // Déclencher lorsque 10% de l'élément est visible
    };

    const callback = (entries) => {
      entries.forEach(entry => {
        const id = entry.target.dataset.id;
        if (id) {
          setVisibleLivrables(prev => ({
            ...prev,
            [id]: entry.isIntersecting
          }));
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);

    // Observer chaque référence de ligne
    filteredLivrables.forEach(livrable => {
      const currentRef = observerRefs.current[livrable.idLivrable];
      if (currentRef && currentRef.current) {
        observer.observe(currentRef.current);
      }
    });

    return () => {
      // Nettoyer l'observer lors du démontage
      observer.disconnect();
    };
  }, [filteredLivrables]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setActionMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Déterminer si l'utilisateur peut modifier ou supprimer un livrable
  const canEdit = (livrable) => {
    // Les étudiants ne peuvent modifier que leurs propres livrables et uniquement s'ils ne sont pas validés
    if (user.role === 'etudiant') {
      return livrable.idEtudiant === user.id && livrable.statut !== StatutLivrable.Validé;
    }
    
    // Les encadrants, tuteurs et responsables peuvent modifier tous les livrables non validés
    return ['encadrant', 'tuteur', 'responsableFiliere'].includes(user.role) && 
           livrable.statut !== StatutLivrable.Validé;
  };

  const canDelete = (livrable) => {
    // Seuls les étudiants propriétaires et les responsables peuvent supprimer des livrables
    if (user.role === 'etudiant') {
      return livrable.idEtudiant === user.id;
    }
    
    return user.role === 'responsableFiliere';
  };

  const canValidate = () => {
    // Seuls les encadrants, tuteurs et responsables peuvent valider/rejeter des livrables
    return ['encadrant', 'tuteur', 'responsableFiliere'].includes(user.role);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen dark:bg-gray-900">
          <nav className="bg-white shadow-md p-4 rounded-lg mb-6 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800 flex-grow text-center mx-4 dark:text-white">
                📁 Suivi des Livrables
              </h1>
              {/* N'afficher le bouton de soumission que pour les étudiants */}
              {user?.role === 'etudiant' && (
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-[#b17a56] text-white rounded-lg hover:bg-[#b17a56]/90 transition dark:bg-[#b17a56] dark:hover:bg-[#b17a56]/80"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Plus size={18} />
                  <span>Soumettre un livrable</span>
                </button>
              )}
            </div>
          </nav>

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

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b17a56]"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg dark:bg-gray-800">
              {filteredLivrables.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p>Aucun livrable trouvé.</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[70vh]" ref={tableRef}>
                  <table className="w-full">
                    <thead className="bg-gray-100 sticky top-0 z-10 dark:bg-gray-700">
                      <tr>
                        <th className="p-4 text-left text-gray-700 dark:text-white">Titre</th>
                        <th className="p-4 text-left text-gray-700 dark:text-white">Type</th>
                        <th className="p-4 text-left text-gray-700 dark:text-white">Date de soumission</th>
                        <th className="p-4 text-left text-gray-700 dark:text-white">Version</th>
                        <th className="p-4 text-left text-gray-700 dark:text-white">Statut</th>
                        <th className="p-4 text-center text-gray-700 dark:text-white">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLivrables.map((livrable) => {
                        // On s'assure que la référence existe pour ce livrable
                        if (!observerRefs.current[livrable.idLivrable]) {
                          observerRefs.current[livrable.idLivrable] = { current: null };
                        }
                        
                        return (
                          <tr
                            key={livrable.idLivrable}
                            ref={el => {
                              // Assigner manuellement la référence
                              observerRefs.current[livrable.idLivrable].current = el;
                            }}
                            data-id={livrable.idLivrable}
                            className={`border-b border-gray-100 hover:bg-gray-50 transition dark:hover:bg-gray-700 ${
                              visibleLivrables[livrable.idLivrable] ? "opacity-100" : "opacity-0"
                            } transition-opacity duration-300`}
                          >
                            <td className="p-4 text-gray-800 dark:text-white">{livrable.titre}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">{livrable.type}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">
                              {formatDate(livrable.dateSoumission)}
                            </td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">v{livrable.version}</td>
                            <td className="p-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  livrable.statut === StatutLivrable.Validé
                                    ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                                    : livrable.statut === StatutLivrable.Soumis
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200"
                                    : livrable.statut === StatutLivrable.Rejeté
                                    ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                                }`}
                              >
                                {livrable.statut}
                              </span>
                            </td>
                            <td className="p-4 text-center relative">
                              <button
                                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleActionMenu(livrable.idLivrable);
                                }}
                                aria-label="Ouvrir le menu d'actions"
                              >
                                <span>Action</span>
                                <ChevronDown size={16} />
                              </button>
                              {actionMenuId === livrable.idLivrable && (
                                <div
                                  ref={actionMenuRef}
                                  className="absolute right-4 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 dark:bg-gray-800 dark:border-gray-700"
                                  role="menu"
                                >
                                  <button
                                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition dark:text-white dark:hover:bg-gray-700"
                                    onClick={() => {
                                      setSelectedLivrable(livrable);
                                      setShowModal(true);
                                      setActionMenuId(null); // Fermer le menu après sélection
                                    }}
                                    role="menuitem"
                                    aria-label="Voir les détails du livrable"
                                  >
                                    <Eye size={16} />
                                    <span>Voir</span>
                                  </button>
                                  
                                  {canEdit(livrable) && (
                                    <button
                                      className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition dark:text-white dark:hover:bg-gray-700"
                                      onClick={() => {
                                        setSelectedLivrable(livrable);
                                        setShowEditModal(true);
                                        setActionMenuId(null); // Fermer le menu après sélection
                                      }}
                                      role="menuitem"
                                      aria-label="Éditer le livrable"
                                    >
                                      <Edit size={16} />
                                      <span>Éditer</span>
                                    </button>
                                  )}
                                  
                                  {canDelete(livrable) && (
                                    <button
                                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 transition dark:text-red-400 dark:hover:bg-red-800"
                                      onClick={() => {
                                        setLivrableToDelete(livrable.idLivrable);
                                        setShowDeleteConfirmation(true);
                                        setActionMenuId(null); // Fermer le menu après sélection
                                      }}
                                      role="menuitem"
                                      aria-label="Supprimer le livrable"
                                    >
                                      <Trash size={16} />
                                      <span>Supprimer</span>
                                    </button>
                                  )}
                                  
                                  {canValidate() && livrable.statut === StatutLivrable.Soumis && (
                                    <>
                                      <button
                                        className="w-full flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-100 transition dark:text-green-400 dark:hover:bg-green-800"
                                        onClick={() => {
                                          handleValidation(livrable.idLivrable, "Validé");
                                          setActionMenuId(null);
                                        }}
                                        role="menuitem"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <span>Valider</span>
                                      </button>
                                      
                                      <button
                                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 transition dark:text-red-400 dark:hover:bg-red-800"
                                        onClick={() => {
                                          handleValidation(livrable.idLivrable, "Rejeté");
                                          setActionMenuId(null);
                                        }}
                                        role="menuitem"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <line x1="18" y1="6" x2="6" y2="18"></line>
                                          <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                        <span>Rejeter</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {showModal && selectedLivrable && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative dark:bg-gray-800">
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowModal(false)}
                  aria-label="Fermer la modale"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">📂 {selectedLivrable.titre}</h2>
                <p className="text-gray-600 mb-2 dark:text-gray-400">📄 <b>Type :</b> {selectedLivrable.type}</p>
                <p className="text-gray-600 mb-2 dark:text-gray-400">🗓️ <b>Date de soumission :</b> {formatDate(selectedLivrable.dateSoumission)}</p>
                <p className="text-gray-600 mb-2 dark:text-gray-400">📝 <b>Version :</b> v{selectedLivrable.version}</p>
                <p className="text-gray-600 mb-4 dark:text-gray-400">🏷️ <b>Statut :</b> {selectedLivrable.statut}</p>
                <p className="text-gray-600 mb-4 dark:text-gray-400">
                  💬 <b>Commentaires :</b> {
                    selectedLivrable.commentaires 
                      ? Array.isArray(selectedLivrable.commentaires)
                        ? selectedLivrable.commentaires
                            .map(comment => typeof comment === 'string' ? comment.replace(/^"|"$/g, '') : String(comment))
                            .join(", ")
                        : typeof selectedLivrable.commentaires === 'string'
                          ? selectedLivrable.commentaires.replace(/^\[|\]|"/g, '')
                          : "Aucun"
                      : "Aucun"
                  }
                </p>
                <p className="text-gray-600 mb-4 dark:text-gray-400">
                  📄 <b>Description :</b> {selectedLivrable.contenu}
                </p>
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#b17a56] text-white rounded-lg hover:bg-[#b17a56]/90 transition dark:bg-[#b17a56] dark:hover:bg-[#b17a56]/80"
                  onClick={() => handleDownload(selectedLivrable)}
                  aria-label="Télécharger le livrable"
                >
                  <Download size={18} />
                  <span>Télécharger</span>
                </button>
              </div>
            </div>
          )}

          {showEditModal && selectedLivrable && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative dark:bg-gray-800">
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowEditModal(false)}
                  aria-label="Fermer la modale"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">📂 Éditer {selectedLivrable.titre}</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const updatedData = {
                      titre: formData.get("titre"),
                      contenu: formData.get("contenu"),
                      type: formData.get("type"),
                      file: formData.get("file").size > 0 ? formData.get("file") : null,
                      statut: "Soumis"
                    };
                    await handleEdit(selectedLivrable.idLivrable, updatedData);
                  }}
                >
                  <div className="mb-4">
                    <label htmlFor="titre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Titre
                    </label>
                    <input
                      type="text"
                      id="titre"
                      name="titre"
                      defaultValue={selectedLivrable.titre}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#b17a56] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="contenu" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      id="contenu"
                      name="contenu"
                      defaultValue={selectedLivrable.contenu}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#b17a56] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      defaultValue={selectedLivrable.type}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#b17a56] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value={TypesLivrable.DocumentationTechnique}>Documentation technique</option>
                      <option value={TypesLivrable.Rapport}>Rapport</option>
                      <option value={TypesLivrable.Presentation}>Présentation</option>
                      <option value={TypesLivrable.CahierDesCharges}>Cahier des charges</option>
                      <option value={TypesLivrable.VideoDemonstration}>Vidéo de démonstration</option>
                      <option value={TypesLivrable.ArticleScientifique}>Article scientifique</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fichier (PDF uniquement)
                    </label>
                    <input
                      type="file"
                      id="file"
                      name="file"
                      accept="application/pdf"
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#b17a56] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Laissez vide pour conserver le fichier actuel</p>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#b17a56] text-white rounded-lg hover:bg-[#b17a56]/90 transition dark:bg-[#b17a56] dark:hover:bg-[#b17a56]/80"
                  >
                    <Edit size={18} />
                    <span>Mettre à jour</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {showUploadModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-96 dark:bg-gray-800">
                <UploadLivrable
                  onCancel={() => setShowUploadModal(false)}
                  onUpload={handleAddLivrable}
                />
              </div>
            </div>
          )}

          {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-96 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">Confirmer la suppression</h2>
                <p className="text-gray-600 mb-6 dark:text-gray-400">Êtes-vous sûr de vouloir supprimer ce livrable ?</p>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    onClick={() => setShowDeleteConfirmation(false)}
                  >
                    Annuler
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition dark:bg-red-600 dark:hover:bg-red-700"
                    onClick={() => {
                      handleDelete(livrableToDelete);
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function LivrablesPage() {
  // Protection de la page selon le rôle
  // Tous les rôles peuvent accéder à cette page, mais les fonctionnalités sont limitées selon le rôle
  return (
    <ProtectedRoute allowedRoles={['etudiant', 'tuteur', 'encadrant', 'responsableFiliere']}>
      <LivrablesContent />
    </ProtectedRoute>
  );
}