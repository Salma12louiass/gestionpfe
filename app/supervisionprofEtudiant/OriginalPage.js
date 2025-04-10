// app/supervisionprofEtudiant/OriginalPage.js
"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

export default function OriginalSupervisionProfPage() {
  const [suivis, setSuivis] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch suivis from the backend API
  useEffect(() => {
    fetchSuivis();
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

  // Format date to display only "YYYY-MM-DD"
  const formatDate = (isoDate) => {
    if (!isoDate) return ""; // Handle cases where the date is empty
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months start at 0
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Filter suivis based on search query
  const filteredSuivis = suivis.filter((suivi) =>
    `${suivi.nom} ${suivi.prenom}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex dark:bg-gray-900">
      <Sidebar />
      
      <div className="w-full">
        <Navbar />
        
        <div className="p-6 max-w-6xl mx-auto bg-gray-50 dark:bg-gray-800 min-h-screen">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center mb-6">
            📝 Suivi PFE (Professeur)
          </h1>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Afficher</span>
              <select
                className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#1a4edbb2] dark:focus:border-[#1a4edbb2] text-gray-800 dark:text-gray-200"
                onChange={(e) => alert(`Afficher ${e.target.value} entrées`)}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">entrées</span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#1a4edbb2] dark:focus:border-[#1a4edbb2] text-gray-800 dark:text-gray-200"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-300" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-600">
                <tr>
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">Date du suivi</th>
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">Nom</th>
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">Prénom</th>
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">Note</th>
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">État d'avancement</th>
                  <th className="p-4 text-left text-gray-700 dark:text-gray-200">Points bloquants</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuivis.map((suivi) => (
                  <tr 
                    key={suivi.idSuivi} 
                    className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                  >
                    <td className="p-4 text-gray-800 dark:text-gray-200">{formatDate(suivi.dateSuivi)}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{suivi.nom}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{suivi.prenom}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{suivi.note}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{suivi.etatAvancement}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{suivi.pointsBloquants}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Affichage de 1 à {filteredSuivis.length} sur {filteredSuivis.length} éléments
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                Précédent
              </button>
              <button className="px-4 py-2 bg-[#b17a56] text-white border border-[#b17a56] rounded-lg hover:bg-[#a06d4b] transition">
                1
              </button>
              <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}