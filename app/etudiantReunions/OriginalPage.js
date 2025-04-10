// app/etudiantReunions/OriginalPage.js
"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Search, Eye, X } from "lucide-react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

const OriginalEtudiantReunionsPage = () => {
  const [reunions, setReunions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReunion, setSelectedReunion] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch meetings from backend
  const fetchReunions = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/reunions");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des réunions");
      }
      const data = await response.json();
      setReunions(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des réunions:", error);
    }
  };

  useEffect(() => {
    fetchReunions();
  }, []);

  // Format date to remove time portion
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  // Format time to remove seconds
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.split(':').slice(0, 2).join(':'); // Keep only hours and minutes
  };

  // Filter meetings based on search query
  const filteredReunions = reunions.filter((r) =>
    r.sujet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open modal with selected meeting details
  const openModal = (reunion) => {
    setSelectedReunion(reunion);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedReunion(null);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      <div className="w-full">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen dark:bg-gray-900">
          {/* Navigation Bar */}
          <nav className="bg-white shadow-md p-4 rounded-lg mb-6 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800 flex-grow text-center mx-4 dark:text-white">
                📅 Réunions
              </h1>
            </div>
          </nav>

          {/* Filters and Search */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Afficher</span>
              <select className="px-2 py-1 bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">entrées</span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          {/* Meetings Table */}
          <div className="bg-white rounded-xl shadow-lg dark:bg-gray-800">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-4 text-left text-gray-700 dark:text-white">Sujet</th>
                  <th className="p-4 text-left text-gray-700 dark:text-white">Date/Heure</th>
                  <th className="p-4 text-left text-gray-700 dark:text-white">Participants</th>
                  <th className="p-4 text-center text-gray-700 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReunions.map((reunion) => (
                  <tr
                    key={reunion.idReunion}
                    className="border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-4 text-gray-800 dark:text-white">{reunion.sujet}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {formatDate(reunion.date)} {formatTime(reunion.heure)}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {reunion.participants.join(", ")}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openModal(reunion)}
                        className="flex items-center gap-1 px-3 py-1 bg-[#b17a56] text-white rounded-lg hover:bg-[#b17a56]/90 dark:bg-[#b17a56] dark:hover:bg-[#b17a56]/80"
                      >
                        <Eye size={16} />
                        <span>Voir</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Affichage de 1 à {filteredReunions.length} sur {filteredReunions.length} éléments
            </span>
            <div className="flex">
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-l-lg hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                Précédent
              </button>
              <button className="px-4 py-2 bg-[#b17a56] text-white border-t border-b border-[#b17a56] dark:bg-[#b17a56]">
                1
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-r-lg hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                Suivant
              </button>
            </div>
          </div>

          {/* Meeting Details Modal */}
          {showModal && selectedReunion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md dark:bg-gray-800">
                <div className="flex justify-between items-center border-b p-4 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Détails de la Réunion
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="border-b pb-4 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {selectedReunion.sujet}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      📅 {formatDate(selectedReunion.date)} {formatTime(selectedReunion.heure)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 dark:text-gray-300">
                        👥 Participants
                      </h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg dark:bg-gray-700 dark:text-gray-300">
                        {selectedReunion.participants.join(", ")}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 dark:text-gray-300">
                        📒 Agenda
                      </h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg dark:bg-gray-700 dark:text-gray-300">
                        {selectedReunion.agenda}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OriginalEtudiantReunionsPage;