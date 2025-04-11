"use client";
import { useState, useEffect } from "react";
import { FaComments, FaPlus, FaTrash, FaSpinner, FaSync, FaEdit, FaSearch } from "react-icons/fa";
import Discussion from "@/app/components/Discussion";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

export default function OriginalDiscussionsPage() {
  const { user: currentUser } = useAuth();
  const [allDiscussions, setAllDiscussions] = useState([]);
  const [userDiscussions, setUserDiscussions] = useState([]);
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

  const fetchDiscussions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5000/api/discussions');
      if (!res.ok) throw new Error('Failed to load discussions');
      const data = await res.json();
      setAllDiscussions(data);
      
      // Filter discussions where user is participant
      const userDiscs = data.filter(d => 
        d.participants.some(p => 
          p.id === currentUser.id && p.type === currentUser.role
        )
      );
      setUserDiscussions(userDiscs);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (!res.ok) throw new Error('Failed to load users');
      setAvailableUsers(await res.json());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchDiscussions();
      if (currentUser.role !== 'etudiant') {
        await fetchUsers();
      }
    };
    loadData();
  }, [currentUser]);

  const handleCreateDiscussion = async () => {
    if (!formData.titre.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsLoading(true);
      const filteredParticipants = formData.participants.filter(
        p => !(p.id === currentUser.id && p.type === currentUser.role)
      );

      const response = await fetch('http://localhost:5000/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: formData.titre.trim(),
          createurId: currentUser.id,
          typeCreateur: currentUser.role,
          participants: filteredParticipants
        })
      });

      if (!response.ok) throw new Error(await response.text());
      await fetchDiscussions();
      setIsModalOpen(false);
      setFormData({ titre: "", participants: [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDiscussion = async (id, newTitle, newParticipants) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/discussions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: newTitle,
          participants: newParticipants
        })
      });

      if (!response.ok) throw new Error(await response.text());
      await fetchDiscussions();
      setIsModalOpen(false);
      setEditingDiscussionId(null);
      setFormData({ titre: "", participants: [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDiscussion = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/discussions/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error(await response.text());
      await fetchDiscussions();
      if (selectedDiscussion?.idDiscussion === id) {
        setSelectedDiscussion(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const toggleParticipant = (user) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.some(p => p.id === user.id && p.type === user.type)
        ? prev.participants.filter(p => !(p.id === user.id && p.type === user.type))
        : [...prev.participants, user]
    }));
  };

  const displayedDiscussions = currentUser.role === 'etudiant' ? userDiscussions : allDiscussions;
  const canCreateDiscussion = currentUser.role !== 'etudiant';

  if (isLoading && allDiscussions.length === 0) {
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
              <button onClick={fetchDiscussions} className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2">
                <FaSync /> Refresh
              </button>
            </div>
          )}

          {selectedDiscussion ? (
            <Discussion 
              discussion={selectedDiscussion} 
              currentUser={currentUser}
              onBack={() => setSelectedDiscussion(null)}
            />
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">My Discussions</h1>
                  {canCreateDiscussion && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-2 bg-[#b17a56] text-white px-4 py-2 rounded hover:bg-[#a06d4b]"
                    >
                      <FaPlus /> New Discussion
                    </button>
                  )}
                </div>

                {displayedDiscussions.length > 0 ? (
                  <div className="space-y-4">
                    {displayedDiscussions.map(discussion => (
                      <div
                        key={discussion.idDiscussion}
                        className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-shadow relative"
                        onClick={() => setSelectedDiscussion(discussion)}
                      >
                        {(currentUser.role !== 'etudiant' && discussion.participants.some(p => 
                          p.id === currentUser.id && p.type === currentUser.role && p.isCreator
                        )) && (
                          <div className="absolute top-2 right-2 flex gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({
                                  titre: discussion.titre,
                                  participants: discussion.participants
                                    .filter(p => !p.isCreator)
                                    .map(p => ({ id: p.id, type: p.type }))
                                });
                                setEditingDiscussionId(discussion.idDiscussion);
                                setIsModalOpen(true);
                              }}
                              className="p-1 text-[#b17a56] hover:text-[#a06d4b]"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDiscussionToDelete(discussion.idDiscussion);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Delete"
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
                                  : p.id === currentUser.id && p.type === currentUser.role
                                    ? 'bg-[#b17a56]/10 text-[#b17a56]'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {p.prenom} {p.nom} {p.isCreator && '(Creator)'}
                            </span>
                          ))}
                          {discussion.participants.length > 3 && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              +{discussion.participants.length - 3}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Created on {new Date(discussion.dateCreation).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaComments className="mx-auto text-5xl text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium">No discussions available</h3>
                    <p className="text-gray-500 mt-2">
                      {currentUser.role === 'etudiant'
                        ? "You are not currently a member of any discussion"
                        : "Create your first discussion to start chatting"}
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
                {editingDiscussionId ? 'Edit Discussion' : 'New Discussion'}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#b17a56]"
                  value={formData.titre}
                  onChange={(e) => setFormData({...formData, titre: e.target.value})}
                  placeholder="Discussion title"
                  required
                />
              </div>
              
              {canCreateDiscussion && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Participants</label>
                  
                  <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#b17a56] focus:border-[#b17a56] sm:text-sm"
                      placeholder="Search participants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border rounded p-2">
                    {availableUsers
                      .filter(user => 
                        !(user.id === currentUser.id && user.type === currentUser.role) &&
                        (user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map(user => (
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
                      ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingDiscussionId(null);
                    setFormData({ titre: "", participants: [] });
                  }}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={editingDiscussionId 
                    ? () => handleEditDiscussion(editingDiscussionId, formData.titre, formData.participants)
                    : handleCreateDiscussion
                  }
                  disabled={!formData.titre || isLoading}
                  className={`px-4 py-2 rounded text-white ${
                    !formData.titre || isLoading
                      ? 'bg-[#b17a56]/50 cursor-not-allowed'
                      : 'bg-[#b17a56] hover:bg-[#a06d4b]'
                  }`}
                >
                  {isLoading ? <FaSpinner className="animate-spin inline mr-2" /> : null}
                  {editingDiscussionId ? 'Save' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Confirm deletion</h2>
            <p className="mb-6">Are you sure you want to delete this discussion?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteDiscussion(discussionToDelete);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}