// app/reunions/OriginalPage.js
"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Search, Trash, Edit, Eye, ChevronDown, X } from "lucide-react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

const OriginalReunionsPage = () => {
  // State management
  const [reunions, setReunions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newReunion, setNewReunion] = useState({
    sujet: "",
    date: "",
    heure: "",
    participants: [],
    agenda: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMenuId, setActionMenuId] = useState(null);
  const [participantsList, setParticipantsList] = useState([]);
  const [participantSearchTerm, setParticipantSearchTerm] = useState("");
  const [reunionToEdit, setReunionToEdit] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedReunion, setSelectedReunion] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reunionToDelete, setReunionToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  // Refs
  const modalRef = useRef(null);
  const dropdownRefs = useRef({});
  const detailsRef = useRef(null);
  const actionButtonsRef = useRef({});

  // Fetch data on component mount
  useEffect(() => {
    fetchReunions();
    fetchParticipants();
  }, []);

  // Handle click outside modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
        setReunionToEdit(null);
      }
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        setShowDetails(false);
      }
      
      if (actionMenuId) {
        const dropdown = dropdownRefs.current[actionMenuId];
        const button = actionButtonsRef.current[actionMenuId];
        if (dropdown && !dropdown.contains(event.target) && 
            (!button || !button.contains(event.target))) {
          setActionMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionMenuId]);

  // API functions
  const fetchReunions = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/reunions");
      if (!response.ok) throw new Error("Failed to fetch meetings");
      const data = await response.json();
      setReunions(data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/participants");
      if (!response.ok) throw new Error("Failed to fetch participants");
      const data = await response.json();
      setParticipantsList(data);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const sendNotification = async (participants, reunion) => {
    try {
      await fetch("http://localhost:5000/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Nouvelle réunion: ${reunion.sujet}`,
          content: `
            <p>Une nouvelle réunion a été planifiée:</p>
            <p><strong>Sujet:</strong> ${reunion.sujet}</p>
            <p><strong>Date:</strong> ${reunion.date}</p>
            <p><strong>Heure:</strong> ${reunion.heure}</p>
            ${reunion.agenda ? `<p><strong>Agenda:</strong> ${reunion.agenda}</p>` : ""}
          `,
          recipients: participants
        })
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Handler functions
  const handleCreateReunion = async () => {
    const user = JSON.parse(localStorage.getItem("user")) || { 
      id: "ENC123", 
      type: "encadrant" 
    };
    
    try {
      const response = await fetch("http://localhost:5000/api/reunions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newReunion,
          createurId: user.id,
          createurType: user.type
        })
      });

      if (!response.ok) throw new Error("Failed to create meeting");

      const createdReunion = await response.json();
      
      if (newReunion.participants.length > 0) {
        await sendNotification(newReunion.participants, newReunion);
      }

      setReunions([...reunions, createdReunion]);
      setShowModal(false);
      setNewReunion({
        sujet: "",
        date: "",
        heure: "",
        participants: [],
        agenda: ""
      });
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  const handleUpdateReunion = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reunions/${reunionToEdit.idReunion}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newReunion)
        }
      );

      if (!response.ok) throw new Error("Failed to update meeting");

      const oldParticipants = new Set(reunionToEdit.participants || []);
      const newParticipants = new Set(newReunion.participants || []);
      const addedParticipants = [...newParticipants].filter(
        p => !oldParticipants.has(p)
      );

      if (addedParticipants.length > 0) {
        await sendNotification(addedParticipants, newReunion);
      }

      await fetchReunions();
      setShowModal(false);
      setReunionToEdit(null);
      
      if (selectedReunion?.idReunion === reunionToEdit.idReunion) {
        setSelectedReunion({ ...selectedReunion, ...newReunion });
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/reunions/${reunionToDelete}`,
        { method: "DELETE" }
      );
      await fetchReunions();
      setShowDeleteConfirm(false);
      setShowDetails(false);
    } catch (error) {
      console.error("Error deleting meeting:", error);
    }
  };

  const handleParticipantChange = (e) => {
    const { value, checked } = e.target;
    setNewReunion(prev => ({
      ...prev,
      participants: checked
        ? [...prev.participants, value]
        : prev.participants.filter(p => p !== value)
    }));
  };

  // Helper functions
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toISOString().split("T")[0] : "";
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.slice(0, 5) : "";
  };

  const filteredParticipants = participantsList.filter(p =>
    p.name.toLowerCase().includes(participantSearchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(participantSearchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(participantSearchTerm.toLowerCase())
  );

  const filteredReunions = reunions.filter(r =>
    r?.sujet?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleActionClick = (e, idReunion) => {
    e.stopPropagation();
    setActionMenuId(idReunion === actionMenuId ? null : idReunion);
    actionButtonsRef.current[idReunion] = e.currentTarget;
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen" style={{ isolation: 'isolate' }}>
          {/* Meeting Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div ref={modalRef} className="bg-white p-6 rounded-xl shadow-lg w-96 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                  {reunionToEdit ? "✏️ Éditer" : "📌 Planifier"} une réunion
                </h2>
                
                <input
                  type="text"
                  placeholder="Sujet"
                  value={newReunion.sujet}
                  onChange={(e) => setNewReunion({...newReunion, sujet: e.target.value})}
                  className="w-full p-2 border rounded-lg mb-4"
                  required
                />
                
                <div className="flex gap-4 mb-4">
                  <input
                    type="date"
                    value={newReunion.date}
                    onChange={(e) => setNewReunion({...newReunion, date: e.target.value})}
                    className="flex-1 p-2 border rounded-lg"
                    required
                  />
                  <input
                    type="time"
                    value={newReunion.heure}
                    onChange={(e) => setNewReunion({...newReunion, heure: e.target.value})}
                    className="flex-1 p-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">👥 Participants</h3>
                  <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher des participants..."
                      value={participantSearchTerm}
                      onChange={(e) => setParticipantSearchTerm(e.target.value)}
                      className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-[#b17a56]"
                    />
                    {participantSearchTerm && (
                      <button
                        onClick={() => setParticipantSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {filteredParticipants.length > 0 ? (
                      filteredParticipants.map(p => (
                        <label
                          key={`${p.type}-${p.id}`}
                          className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            value={`${p.type}:${p.id}`}
                            checked={newReunion.participants.includes(`${p.type}:${p.id}`)}
                            onChange={handleParticipantChange}
                            className="form-checkbox h-4 w-4 text-[#b17a56] rounded"
                          />
                          <span className="text-gray-800">
                            {p.name} ({p.type})
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Aucun participant trouvé
                      </div>
                    )}
                  </div>
                </div>
                
                <textarea
                  placeholder="Agenda (optionnel)"
                  value={newReunion.agenda}
                  onChange={(e) => setNewReunion({...newReunion, agenda: e.target.value})}
                  className="w-full p-2 border rounded-lg mb-4"
                  rows={4}
                />
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setReunionToEdit(null);
                    }}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={reunionToEdit ? handleUpdateReunion : handleCreateReunion}
                    className="px-4 py-2 bg-[#b17a56] text-white rounded-lg hover:bg-[#a06d4b]"
                    disabled={!newReunion.sujet || !newReunion.date || !newReunion.heure}
                  >
                    {reunionToEdit ? "Mettre à jour" : "Créer"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Confirmer la suppression</h2>
                <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette réunion ?</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Meeting Details Modal */}
          {showDetails && selectedReunion && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div ref={detailsRef} className="bg-white p-6 rounded-xl shadow-lg w-96">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{selectedReunion.sujet}</h2>
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600">
                      <span className="font-semibold">📅 Date:</span> {formatDate(selectedReunion.date)} {formatTime(selectedReunion.heure)}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">👥 Participants</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {selectedReunion.participants.length > 0 ? (
                        selectedReunion.participants.map((p, i) => {
                          const [type, id] = p.split(":");
                          const participant = participantsList.find(pl => 
                            pl.type === type && pl.id === id
                          );
                          return (
                            <div key={i} className="mb-1 last:mb-0">
                              {participant ? participant.name : "Inconnu"} ({type})
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-500">Aucun participant</p>
                      )}
                    </div>
                  </div>
                  
                  {selectedReunion.agenda && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">📒 Agenda</h3>
                      <div className="bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                        {selectedReunion.agenda}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <nav className="bg-white shadow-md p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800 flex-grow text-center mx-4">
                📅 Réunions
              </h1>
              <button
                onClick={() => {
                  setReunionToEdit(null);
                  setNewReunion({
                    sujet: "",
                    date: "",
                    heure: "",
                    participants: [],
                    agenda: ""
                  });
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#b17a56] text-white rounded-lg hover:bg-[#a06d4b] transition"
              >
                <Plus size={18} />
                <span>Planifier une réunion</span>
              </button>
            </div>
          </nav>

          {/* Search and Filter */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Afficher</span>
              <select className="px-2 py-1 bg-white border border-gray-300 rounded-lg">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>Tous</option>
              </select>
              <span className="text-sm text-gray-600">entrées</span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:border-[#b17a56]"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Reunions Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-visible relative z-0">
            <table className="w-full relative" style={{ zIndex: 0 }}>
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left text-gray-700">Sujet</th>
                  <th className="p-4 text-left text-gray-700">Date/Heure</th>
                  <th className="p-4 text-left text-gray-700">Participants</th>
                  <th className="p-4 text-center text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                      Chargement en cours...
                    </td>
                  </tr>
                ) : filteredReunions.length > 0 ? (
                  filteredReunions.map(reunion => (
                    <tr key={reunion.idReunion} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 text-gray-800">{reunion.sujet}</td>
                      <td className="p-4 text-gray-600">
                        {formatDate(reunion.date)} {formatTime(reunion.heure)}
                      </td>
                      <td className="p-4 text-gray-600">
                        {reunion.participants.slice(0, 2).map((p, i) => {
                          const [type, id] = p.split(":");
                          const participant = participantsList.find(pl => 
                            pl.type === type && pl.id === id
                          );
                          return (
                            <span key={i}>
                              {participant ? participant.name : "Inconnu"}
                              {i < reunion.participants.length - 1 && i < 1 ? ", " : ""}
                              {i === 1 && reunion.participants.length > 2 && "..."}
                            </span>
                          );
                        })}
                      </td>
                      <td className="p-4 text-center relative">
                        <div className="inline-block">
                          <button
                            ref={el => actionButtonsRef.current[reunion.idReunion] = el}
                            onClick={(e) => handleActionClick(e, reunion.idReunion)}
                            className="action-button flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 relative z-20"
                          >
                            <span>Actions</span>
                            <ChevronDown 
                              size={16} 
                              className={`transition-transform duration-200 ${
                                actionMenuId === reunion.idReunion ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          
                          {actionMenuId === reunion.idReunion && (
                            <div 
                              ref={el => dropdownRefs.current[reunion.idReunion] = el}
                              className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[1000]"
                              style={{
                                top: '100%'
                              }}
                            >
                              <button
                                onClick={() => {
                                  setSelectedReunion(reunion);
                                  setShowDetails(true);
                                  setActionMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 text-left"
                              >
                                <Eye size={16} className="text-gray-500" />
                                <span>Voir</span>
                              </button>
                              <button
                                onClick={() => {
                                  setReunionToEdit(reunion);
                                  setNewReunion({
                                    sujet: reunion.sujet,
                                    date: reunion.date,
                                    heure: reunion.heure,
                                    participants: reunion.participants,
                                    agenda: reunion.agenda
                                  });
                                  setShowModal(true);
                                  setActionMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 text-left"
                              >
                                <Edit size={16} className="text-gray-500" />
                                <span>Éditer</span>
                              </button>
                              <button
                                onClick={() => {
                                  setReunionToDelete(reunion.idReunion);
                                  setShowDeleteConfirm(true);
                                  setActionMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 text-left"
                              >
                                <Trash size={16} className="text-red-500" />
                                <span>Supprimer</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                      Aucune réunion trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-600">
              Affichage de 1 à {filteredReunions.length} sur {filteredReunions.length} éléments
            </span>
            <div className="flex">
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-l-lg hover:bg-gray-100">
                Précédent
              </button>
              <button className="px-4 py-2 bg-[#b17a56] text-white border-t border-b border-[#b17a56]">
                1
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-r-lg hover:bg-gray-100">
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginalReunionsPage;