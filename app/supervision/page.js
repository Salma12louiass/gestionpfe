// MON-PROJET/app/supervision/page.js
"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Search, Trash, Edit, ChevronDown } from "lucide-react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

export default function SupervisionPage() {
  const [suivis, setSuivis] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMenuId, setActionMenuId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [suiviToDelete, setSuiviToDelete] = useState(null);
  const [newSuivi, setNewSuivi] = useState({
    dateSuivi: "",
    nom: "",
    prenom: "",
    note: "",
    etatAvancement: "",
    pointsBloquants: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Ref to track the action menu
  const actionMenuRef = useRef(null);

  // Charger les suivis depuis l'API et vérifier le rôle de l'utilisateur
  useEffect(() => {
    fetchSuivis();
    checkUserRole();
  }, []);

  const checkUserRole = () => {
    // Get user from localStorage or set default for demo
    const user = JSON.parse(localStorage.getItem("user")) || { 
      id: "T002", 
      type: "tuteur" // Default to tuteur for demo
    };
    setUserRole(user.type);
  };

  // Close the action menu when clicking outside
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

  const fetchSuivis = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/suivis");
      if (!response.ok) {
        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
      }
      const data = await response.json();
      setSuivis(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des suivis:", error);
      alert("Échec de la récupération des suivis. Veuillez vérifier le serveur backend.");
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleAddSuivi = async () => {
    if (!newSuivi.dateSuivi || !newSuivi.nom || !newSuivi.prenom || !newSuivi.note || !newSuivi.etatAvancement || !newSuivi.pointsBloquants) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `http://localhost:5000/api/suivis/${newSuivi.idSuivi}` : "http://localhost:5000/api/suivis";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newSuivi,
          idTuteur: newSuivi.idTuteur || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
      }

      fetchSuivis();
      setShowAddModal(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout ou de la modification du suivi:", error);
      alert("Échec de l'ajout ou de la modification du suivi.");
    }
  };

  const handleDeleteSuivi = async (idSuivi) => {
    try {
      const response = await fetch(`http://localhost:5000/api/suivis/${idSuivi}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
      }

      fetchSuivis();
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error("Erreur lors de la suppression du suivi:", error);
      alert("Échec de la suppression du suivi.");
    }
  };

  const handleAddSuiviClick = () => {
    if (userRole !== "tuteur") {
      alert("Seuls les tuteurs peuvent ajouter des suivis");
      return;
    }
    setIsEditing(false);
    setNewSuivi({
      dateSuivi: "",
      nom: "",
      prenom: "",
      note: "",
      etatAvancement: "",
      pointsBloquants: "",
    });
    setShowAddModal(true);
  };

  const handleEditSuivi = (idSuivi) => {
    if (userRole !== "tuteur") {
      alert("Seuls les tuteurs peuvent modifier des suivis");
      return;
    }
    const suiviToEdit = suivis.find((suivi) => suivi.idSuivi === idSuivi);
    setNewSuivi(suiviToEdit);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const filteredSuivis = suivis.filter((suivi) =>
    `${suivi.nom} ${suivi.prenom}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen dark:bg-gray-900">
          <nav className="bg-white shadow-md p-4 rounded-lg mb-6 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800 flex-grow text-center mx-4 dark:text-white">
                📝 Suivi PFE
              </h1>
              {userRole === "tuteur" && (
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-[#b17a56] text-white rounded-lg hover:bg-[#a06d4b] transition"
                  onClick={handleAddSuiviClick}
                >
                  <Plus size={18} />
                  <span>Ajouter un suivi</span>
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
                className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#1a4edbb2] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg dark:bg-gray-800">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-4 text-left text-gray-700 dark:text-white">Date du suivi</th>
                  <th className="p-4 text-left text-gray-700 dark:text-white">Nom</th>
                  <th className="p-4 text-left text-gray-700 dark:text-white">Prénom</th>
                  <th className="p-4 text-left text-gray-700 dark:text-white">Note</th>
                  <th className="p-4 text-left text-gray-700 dark:text-white">État d'avancement</th>
                  <th className="p-4 text-left text-gray-700 dark:text-white">Points bloquants</th>
                  {userRole === "tuteur" && (
                    <th className="p-4 text-center text-gray-700 dark:text-white">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredSuivis.map((suivi) => (
                  <tr key={suivi.idSuivi} className="border-b border-gray-100 hover:bg-gray-50 transition dark:hover:bg-gray-700">
                    <td className="p-4 text-gray-800 dark:text-white">{formatDate(suivi.dateSuivi)}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{suivi.nom}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{suivi.prenom}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{suivi.note}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{suivi.etatAvancement}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{suivi.pointsBloquants}</td>
                    {userRole === "tuteur" && (
                      <td className="p-4 text-center relative">
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                          onClick={() => setActionMenuId(suivi.idSuivi)}
                        >
                          <span>Action</span>
                          <ChevronDown size={16} />
                        </button>
                        {actionMenuId === suivi.idSuivi && (
                          <div
                            ref={actionMenuRef}
                            className="absolute right-4 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 dark:bg-gray-800 dark:border-gray-700"
                          >
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition dark:text-white dark:hover:bg-gray-700"
                              onClick={() => handleEditSuivi(suivi.idSuivi)}
                            >
                              <Edit size={16} />
                              <span>Éditer</span>
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 transition dark:text-red-400 dark:hover:bg-red-800"
                              onClick={() => {
                                setSuiviToDelete(suivi.idSuivi);
                                setShowDeleteConfirmation(true);
                              }}
                            >
                              <Trash size={16} />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-xl shadow-lg w-96 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">
                  {isEditing ? "Modifier un suivi" : "Ajouter un suivi"}
                </h2>
                <div className="space-y-4">
                  <input
                    type="date"
                    placeholder="Date du suivi"
                    value={newSuivi.dateSuivi}
                    onChange={(e) => setNewSuivi({ ...newSuivi, dateSuivi: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4edbb2] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Nom"
                    value={newSuivi.nom}
                    onChange={(e) => setNewSuivi({ ...newSuivi, nom: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4edbb2] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={newSuivi.prenom}
                    onChange={(e) => setNewSuivi({ ...newSuivi, prenom: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4edbb2] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Note"
                    value={newSuivi.note}
                    onChange={(e) => setNewSuivi({ ...newSuivi, note: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4edbb2] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="État d'avancement"
                    value={newSuivi.etatAvancement}
                    onChange={(e) => setNewSuivi({ ...newSuivi, etatAvancement: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4edbb2] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Points bloquants"
                    value={newSuivi.pointsBloquants}
                    onChange={(e) => setNewSuivi({ ...newSuivi, pointsBloquants: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4edbb2] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    onClick={() => setShowAddModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    className="px-4 py-2 bg-[#b17a56] text-white rounded-lg hover:bg-[#a06d4b] transition"
                    onClick={handleAddSuivi}
                  >
                    {isEditing ? "Modifier" : "Ajouter"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-xl shadow-lg w-96 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">Confirmer la suppression</h2>
                <p className="text-gray-600 mb-6 dark:text-gray-400">Êtes-vous sûr de vouloir supprimer ce suivi ?</p>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    onClick={() => setShowDeleteConfirmation(false)}
                  >
                    Annuler
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition dark:bg-red-600 dark:hover:bg-red-700"
                    onClick={() => handleDeleteSuivi(suiviToDelete)}
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
}