//MON-PROJET/app/discussionsEtudiant/page.js
"use client";
import { useState, useEffect } from "react";
import { FaComments, FaSpinner, FaSync } from "react-icons/fa";
import Discussion from "@/app/components/Discussion";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = { 
    id: "ET123", 
    type: "etudiant", 
    nom: "Dupont", 
    prenom: "Jean", 
    email: "jean.dupont@email.com" 
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/discussions');
      
      if (!response.ok) throw new Error('Erreur chargement discussions');

      const discussionsData = await response.json();
      
      // Filtrer seulement les discussions où l'étudiant est participant
      const filteredDiscussions = discussionsData.filter(discussion => 
        discussion.participants.some(p => 
          p.id === currentUser.id && p.type === currentUser.type
        )
      );
      
      setDiscussions(filteredDiscussions);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  if (isLoading && discussions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-[#b17a56]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {!selectedDiscussion && <Navbar />}
        
        <main className="flex-1 p-6 overflow-hidden">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <p>{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
              >
                <FaSync /> Réessayer
              </button>
            </div>
          )}

          {selectedDiscussion ? (
            <div className="h-full">
              <Discussion 
                discussion={selectedDiscussion} 
                currentUser={currentUser}
                onBack={() => setSelectedDiscussion(null)}
              />
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">Mes Discussions</h1>
                </div>

                {discussions.length > 0 ? (
                  <div className="space-y-4">
                    {discussions.map(discussion => (
                      <div
                        key={discussion.idDiscussion}
                        className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-shadow"
                        onClick={() => setSelectedDiscussion(discussion)}
                      >
                        <h3 className="font-bold text-lg">{discussion.titre}</h3>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {discussion.participants.slice(0, 3).map(p => (
                            <span 
                              key={`${p.type}-${p.id}`}
                              className={`text-xs px-2 py-1 rounded ${
                                p.isCreator 
                                  ? 'bg-green-100 text-green-800'
                                  : p.id === currentUser.id && p.type === currentUser.type
                                    ? 'bg-[#b17a56]/10 text-[#b17a56]'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {p.prenom} {p.nom} {p.isCreator && '(Créateur)'}
                            </span>
                          ))}
                          {discussion.participants.length > 3 && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              +{discussion.participants.length - 3}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Créée le {new Date(discussion.dateCreation).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaComments className="mx-auto text-5xl text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium">Aucune discussion disponible</h3>
                    <p className="text-gray-500 mt-2">
                      Vous n'êtes actuellement membre d'aucune discussion
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}