//MON-PROJET/app/discussions/page.js
"use client";
import { useState, useEffect } from "react";
import { FaComments, FaPlus, FaTrash, FaSpinner, FaSync, FaEdit, FaSearch } from "react-icons/fa";
import Discussion from "@/app/components/Discussion";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscussionId, setEditingDiscussionId] = useState(null);
  const [formData, setFormData] = useState({ 
    titre: "", 
    participants: [] 
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [discussionToDelete, setDiscussionToDelete] = useState(null);

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
      
      const [discussionsRes, usersRes] = await Promise.all([
        fetch('http://localhost:5000/api/discussions'),
        fetch('http://localhost:5000/api/users')
      ]);

      if (!discussionsRes.ok) throw new Error('Erreur chargement discussions');
      if (!usersRes.ok) throw new Error('Erreur chargement utilisateurs');

      const discussionsData = await discussionsRes.json();
      const usersData = await usersRes.json();

      setDiscussions(discussionsData);
      setAvailableUsers(usersData);
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

  const handleCreateDiscussion = async () => {
    if (!formData.titre.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const filteredParticipants = formData.participants.filter(
        p => !(p.id === currentUser.id && p.type === currentUser.type)
      );

      if (editingDiscussionId) {
        await handleEditDiscussion(
          editingDiscussionId,
          formData.titre.trim(),
          filteredParticipants
        );
      } else {
        const response = await fetch('http://localhost:5000/api/discussions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            titre: formData.titre.trim(),
            createurId: currentUser.id,
            typeCreateur: currentUser.type,
            participants: filteredParticipants
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur création discussion');
        }

        const newDiscussion = await response.json();
        setDiscussions(prev => [{
          ...newDiscussion,
          participants: [
            {
              id: currentUser.id,
              type: currentUser.type,
              prenom: currentUser.prenom,
              nom: currentUser.nom,
              email: currentUser.email,
              isCreator: true
            },
            ...filteredParticipants.map(p => ({
              ...p,
              isCreator: false,
              ...availableUsers.find(u => u.id === p.id && u.type === p.type)
            }))
          ]
        }, ...prev]);
        setIsModalOpen(false);
        setFormData({ titre: "", participants: [] });
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDiscussion = async (id, newTitle, newParticipants) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/discussions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titre: newTitle,
          participants: newParticipants
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur modification discussion');
      }

      const updatedDiscussions = discussions.map(d => {
        if (d.idDiscussion === id) {
          return {
            ...d,
            titre: newTitle,
            participants: [
              ...d.participants.filter(p => p.isCreator),
              ...newParticipants.map(p => ({
                ...p,
                isCreator: false,
                ...availableUsers.find(u => u.id === p.id && u.type === p.type)
              }))
            ]
          };
        }
        return d;
      });

      setDiscussions(updatedDiscussions);
      
      if (selectedDiscussion?.idDiscussion === id) {
        setSelectedDiscussion(updatedDiscussions.find(d => d.idDiscussion === id));
      }

      setIsModalOpen(false);
      setEditingDiscussionId(null);
      setFormData({ titre: "", participants: [] });
    } catch (err) {
      console.error('Edit error:', err);
      setError(err.message || 'Erreur lors de la modification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDiscussion = async (id) => {
    setDiscussionToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/discussions/${discussionToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur suppression discussion');
      }

      setDiscussions(prev => prev.filter(d => d.idDiscussion !== discussionToDelete));
      if (selectedDiscussion?.idDiscussion === discussionToDelete) {
        setSelectedDiscussion(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDiscussionToDelete(null);
    }
  };

  const toggleParticipant = (user) => {
    setFormData(prev => {
      const isSelected = prev.participants.some(
        p => p.id === user.id && p.type === user.type
      );
      
      return {
        ...prev,
        participants: isSelected
          ? prev.participants.filter(p => !(p.id === user.id && p.type === user.type))
          : [...prev.participants, user]
      };
    });
  };

  const filteredUsers = availableUsers.filter(user => 
    !(user.id === currentUser.id && user.type === currentUser.type) &&
    (user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                  <button
                    onClick={() => {
                      setIsModalOpen(true);
                      setEditingDiscussionId(null);
                      setFormData({ titre: "", participants: [] });
                      setSearchTerm("");
                    }}
                    className="flex items-center gap-2 bg-[#b17a56] text-white px-4 py-2 rounded hover:bg-[#a06d4b]"
                    disabled={isLoading}
                  >
                    <FaPlus /> Nouvelle Discussion
                  </button>
                </div>

                {discussions.length > 0 ? (
                  <div className="space-y-4">
                    {discussions.map(discussion => (
                      <div
                        key={discussion.idDiscussion}
                        className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-shadow relative"
                        onClick={() => setSelectedDiscussion(discussion)}
                      >
                        {(discussion.participants.some(p => 
                          p.id === currentUser.id && 
                          p.type === currentUser.type &&
                          p.isCreator
                        ) || currentUser.type === 'responsable') && (
                          <div className="absolute top-2 right-2 flex gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({
                                  titre: discussion.titre,
                                  participants: discussion.participants
                                    .filter(p => !p.isCreator)
                                    .map(p => ({
                                      id: p.id,
                                      type: p.type
                                    }))
                                });
                                setEditingDiscussionId(discussion.idDiscussion);
                                setIsModalOpen(true);
                                setSearchTerm("");
                              }}
                              className="p-1 text-[#b17a56] hover:text-[#a06d4b]"
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDiscussion(discussion.idDiscussion);
                              }}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Supprimer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                        
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
                      Créez votre première discussion pour commencer à échanger
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingDiscussionId ? 'Modifier Discussion' : 'Nouvelle Discussion'}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Titre *</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#b17a56]"
                  value={formData.titre}
                  onChange={(e) => setFormData({...formData, titre: e.target.value})}
                  placeholder="Titre de la discussion"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Participants</label>
                
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#b17a56] focus:border-[#b17a56] sm:text-sm"
                    placeholder="Rechercher des participants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto border rounded p-2">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div
                        key={`${user.type}-${user.id}`}
                        className={`flex items-center p-2 rounded cursor-pointer ${
                          formData.participants.some(p => p.id === user.id && p.type === user.type)
                            ? 'bg-[#b17a56]/10'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => toggleParticipant(user)}
                      >
                        <input
                          type="checkbox"
                          checked={formData.participants.some(p => p.id === user.id && p.type === user.type)}
                          readOnly
                          className="mr-2"
                        />
                        <div>
                          <p>{user.prenom} {user.nom}</p>
                          <p className="text-xs text-gray-500">{user.type} • {user.email}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Aucun participant trouvé
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingDiscussionId(null);
                    setFormData({ titre: "", participants: [] });
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateDiscussion}
                  disabled={!formData.titre || isLoading}
                  className={`px-4 py-2 rounded text-white ${
                    !formData.titre || isLoading
                      ? 'bg-[#b17a56]/50 cursor-not-allowed'
                      : 'bg-[#b17a56] hover:bg-[#a06d4b]'
                  }`}
                >
                  {isLoading ? <FaSpinner className="animate-spin inline mr-2" /> : null}
                  {editingDiscussionId ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Confirmer la suppression</h2>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette discussion ?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}