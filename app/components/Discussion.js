//MON-PROJET/app/components/Discussion.js
"use client";
import { useState, useEffect, useRef } from "react";
import { 
  FaReply, 
  FaTimes, 
  FaTrash, 
  FaEdit, 
  FaSpinner, 
  FaArrowLeft, 
  FaCheckDouble,
  FaImage,
  FaFileAlt,
  FaPalette,
  FaSearch,
  FaCopy,
  FaUsers
} from "react-icons/fa";
import { BsThreeDotsVertical, BsEmojiSmile, BsPaperclip } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(
  () => import('emoji-picker-react'),
  { ssr: false }
);

const Discussion = ({ discussion, currentUser, onBack }) => {
  // States
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState({
    messages: true,
    sending: false,
    deleting: null,
    editing: null,
    uploading: false,
    changingName: false,
    loadingMedia: false
  });
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [attachments, setAttachments] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState({
    show: false,
    messageId: null
  });
  const [showParticipants, setShowParticipants] = useState(false);
  const [newGroupName, setNewGroupName] = useState(discussion.titre);
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [theme, setTheme] = useState("light");
  const [mediaType, setMediaType] = useState("all");

  // Refs
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const groupNameInputRef = useRef(null);
  const searchInputRef = useRef(null);

  const themeColors = {
    light: {
      primary: "#1a4edbb2",
      bg: "#ffffff",
      text: "#333333",
      messageIn: "#f0f0f0",
      messageOut: "#1a4edb20"
    },
    dark: {
      primary: "#1a3a8bb2",
      bg: "#1e1e1e",
      text: "#f0f0f0",
      messageIn: "#2d2d2d",
      messageOut: "#1a3a8b40"
    },
    green: {
      primary: "#2e7d32b2",
      bg: "#f5f5f5",
      text: "#333333",
      messageIn: "#e8f5e9",
      messageOut: "#c8e6c9"
    }
  };

  const currentTheme = themeColors[theme];

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return <FaFileAlt className="text-red-500" />;
    if (mimeType.includes('image')) return <FaImage className="text-blue-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(prev => ({ ...prev, messages: true }));
        
        const response = await fetch(
          `http://localhost:5000/api/discussions/${discussion.idDiscussion}/messages`
        );
        
        if (!response.ok) throw new Error('Failed to load messages');
        
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(prev => ({ ...prev, messages: false }));
      }
    };

    fetchMessages();
  }, [discussion.idDiscussion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, attachments]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && 
          !event.target.closest('.emoji-picker') && 
          !event.target.closest('.emoji-button')) {
        setShowEmojiPicker(false);
      }
      
      if (showOptionsMenu && optionsMenuRef.current && 
          !optionsMenuRef.current.contains(event.target) && 
          !event.target.closest('.options-button')) {
        setShowOptionsMenu(false);
      }

      if (isEditingGroupName && 
          !event.target.closest('.group-name-edit') && 
          !event.target.closest('.group-name-display')) {
        setIsEditingGroupName(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, showOptionsMenu, isEditingGroupName]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    e.target.value = '';
  };

  const uploadFiles = async (messageId) => {
    if (selectedFiles.length === 0) return [];
  
    setIsLoading(prev => ({ ...prev, uploading: true }));
  
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('file', file));
  
      const response = await fetch(
        `http://localhost:5000/api/messages/${messageId}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
  
      if (!response.ok) throw new Error('Upload failed');
      
      const uploadedFiles = await response.json();
      setSelectedFiles([]);
      return uploadedFiles;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsLoading(prev => ({ ...prev, uploading: false }));
    }
  };

  const fetchMessageAttachments = async (messageId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/${messageId}/files`
      );
      if (!response.ok) throw new Error('Failed to fetch attachments');
      const files = await response.json();
      setAttachments(prev => ({ ...prev, [messageId]: files }));
    } catch (err) {
      console.error('Fetch attachments error:', err);
    }
  };

  const handleDeleteFile = async (fileId, messageId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/files/${fileId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete file');

      setAttachments(prev => ({
        ...prev,
        [messageId]: prev[messageId].filter(file => file.idFichier !== fileId)
      }));
    } catch (err) {
      console.error('Delete file error:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) {
      alert("Veuillez saisir un message ou ajouter un fichier");
      return;
    }
  
    try {
      setIsLoading(prev => ({ ...prev, sending: true }));
  
      let messageContent = newMessage.trim();
      
      if (replyingTo) {
        messageContent = `>> @${replyingTo.prenom}: ${replyingTo.content}\n${messageContent}`;
      }
  
      const messageResponse = await fetch(
        `http://localhost:5000/api/discussions/${discussion.idDiscussion}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: messageContent || "(Message avec pièce jointe)",
            idAuteur: currentUser.id,
            typeAuteur: currentUser.type,
            replyTo: replyingTo?.idMessage || null
          })
        }
      );
  
      if (!messageResponse.ok) {
        const errorData = await messageResponse.json();
        throw new Error(errorData.error || 'Échec de l\'envoi du message');
      }
  
      const newMsg = await messageResponse.json();
      
      if (selectedFiles.length > 0) {
        try {
          const uploadedFiles = await uploadFiles(newMsg.idMessage);
          setAttachments(prev => ({ ...prev, [newMsg.idMessage]: uploadedFiles }));
        } catch (uploadError) {
          await fetch(
            `http://localhost:5000/api/messages/${newMsg.idMessage}`,
            { method: 'DELETE' }
          );
          throw uploadError;
        }
      }
  
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      setReplyingTo(null);
      setSelectedFiles([]);
      
    } catch (err) {
      console.error('Erreur de message:', err);
      alert(`Erreur: ${err.message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, sending: false }));
    }
  };

  const handleDeleteMessage = async (idMessage) => {
    setShowDeleteConfirm({ show: true, messageId: idMessage });
  };

  const confirmDeleteMessage = async () => {
    if (!showDeleteConfirm.messageId) return;

    try {
      setIsLoading(prev => ({ ...prev, deleting: showDeleteConfirm.messageId }));

      const response = await fetch(
        `http://localhost:5000/api/messages/${showDeleteConfirm.messageId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Échec de la suppression du message');
      }
      
      setMessages(prev => prev.filter(msg => msg.idMessage !== showDeleteConfirm.messageId));
      setSelectedMessage(null);
      
      if (attachments[showDeleteConfirm.messageId]) {
        setAttachments(prev => {
          const newAttachments = { ...prev };
          delete newAttachments[showDeleteConfirm.messageId];
          return newAttachments;
        });
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert("Une erreur est survenue lors de la suppression du message");
    } finally {
      setIsLoading(prev => ({ ...prev, deleting: null }));
      setShowDeleteConfirm({ show: false, messageId: null });
    }
  };

  const startEditing = (message) => {
    setEditingMessageId(message.idMessage);
    setEditContent(message.content.split('\n').slice(1).join('\n'));
    setSelectedMessage(null);
  };

  const saveEdit = async () => {
    if (!editContent.trim()) return;

    try {
      setIsLoading(prev => ({ ...prev, editing: editingMessageId }));

      let contentToSave = editContent;
      const originalMessage = messages.find(m => m.idMessage === editingMessageId);
      if (originalMessage?.idMessageRepondu) {
        const repliedTo = getRepliedMessage(originalMessage.idMessageRepondu);
        contentToSave = `>> @${repliedTo.prenom}: ${repliedTo.content}\n${editContent}`;
      }

      const response = await fetch(
        `http://localhost:5000/api/messages/${editingMessageId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: contentToSave })
        }
      );

      if (!response.ok) throw new Error('Failed to edit message');

      setMessages(prev => prev.map(msg => 
        msg.idMessage === editingMessageId ? { ...msg, content: contentToSave } : msg
      ));
      setEditingMessageId(null);
      setEditContent("");
    } catch (err) {
      console.error('Edit error:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, editing: null }));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        const originalMessage = selectedMessage;
        setSelectedMessage('copied');
        setTimeout(() => setSelectedMessage(originalMessage), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const formatMessageContent = (content) => {
    const lines = content.split('\n');
    const isReply = lines[0]?.startsWith('>> @');
    
    return lines.map((line, i) => {
      if (i === 0 && isReply) {
        return null;
      }
      return <div key={i} className="whitespace-pre-wrap">{line}</div>;
    }).filter(Boolean);
  };

  const getRepliedMessage = (id) => {
    return messages.find((message) => message.idMessage === id);
  };

  const handleEmojiClick = (emojiData) => {
    const input = inputRef.current;
    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;
    
    setNewMessage(prev => 
      prev.substring(0, startPos) + 
      emojiData.emoji + 
      prev.substring(endPos)
    );
    
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(
        startPos + emojiData.emoji.length,
        startPos + emojiData.emoji.length
      );
    }, 0);
    
    setShowEmojiPicker(false);
  };

  const changeGroupName = async () => {
    if (!newGroupName.trim() || newGroupName === discussion.titre) {
      setIsEditingGroupName(false);
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, changingName: true }));

      const response = await fetch(
        `http://localhost:5000/api/discussions/${discussion.idDiscussion}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titre: newGroupName })
        }
      );

      if (!response.ok) throw new Error('Failed to change group name');

      discussion.titre = newGroupName;
      setIsEditingGroupName(false);
    } catch (err) {
      console.error('Change group name error:', err);
      alert("Une erreur est survenue lors du changement de nom du groupe");
    } finally {
      setIsLoading(prev => ({ ...prev, changingName: false }));
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = searchQuery === "" || 
      message.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showMedia) {
      const hasAttachments = attachments[message.idMessage]?.length > 0;
      if (mediaType === "all") return hasAttachments && matchesSearch;
      
      const hasSpecificMedia = attachments[message.idMessage]?.some(file => {
        if (mediaType === "images") return file.typeMIME.includes('image');
        if (mediaType === "documents") return file.typeMIME.includes('pdf') || file.typeMIME.includes('document');
        return false;
      });
      
      return hasSpecificMedia && matchesSearch;
    }
    
    return matchesSearch;
  });

  const allMedia = Object.values(attachments).flat();

  const filteredMedia = allMedia.filter(file => {
    if (mediaType === "all") return true;
    if (mediaType === "images") return file.typeMIME.includes('image');
    if (mediaType === "documents") return file.typeMIME.includes('pdf') || file.typeMIME.includes('document');
    return false;
  });

  const discussionOptions = [
    { 
      label: "Change group name", 
      icon: <FaEdit className="mr-2" />,
      action: () => {
        setIsEditingGroupName(true);
        setShowOptionsMenu(false);
        setTimeout(() => groupNameInputRef.current?.focus(), 0);
      } 
    },
    { 
      label: showSearch ? "Hide search" : "Search", 
      icon: <FaSearch className="mr-2" />,
      action: () => {
        setShowSearch(!showSearch);
        setShowOptionsMenu(false);
        if (!showSearch) {
          setSearchQuery("");
        }
      }
    },
    { 
      label: `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`, 
      icon: <FaPalette className="mr-2" />,
      action: () => {
        const themes = Object.keys(themeColors);
        const currentIndex = themes.indexOf(theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        setTheme(nextTheme);
        setShowOptionsMenu(false);
      }
    }
  ];

  return (
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Discussion header */}
      <div 
        className="text-white p-3 flex items-center shadow-md"
        style={{ backgroundColor: currentTheme.primary }}
      >
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-opacity-80 mr-2"
          style={{ backgroundColor: `${currentTheme.primary}80` }}
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-grow">
          {isEditingGroupName ? (
            <div className="group-name-edit flex items-center">
              <input
                ref={groupNameInputRef}
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    changeGroupName();
                  } else if (e.key === 'Escape') {
                    setIsEditingGroupName(false);
                    setNewGroupName(discussion.titre);
                  }
                }}
                className="bg-transparent border-b border-white focus:outline-none flex-1 mr-2"
              />
              <button
                onClick={changeGroupName}
                disabled={isLoading.changingName}
                className="p-1 rounded hover:bg-opacity-80"
                style={{ backgroundColor: `${currentTheme.primary}80` }}
              >
                {isLoading.changingName ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaCheckDouble />
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditingGroupName(false);
                  setNewGroupName(discussion.titre);
                }}
                className="p-1 rounded hover:bg-opacity-80 ml-1"
                style={{ backgroundColor: `${currentTheme.primary}80` }}
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <div 
              className="group-name-display cursor-pointer"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <h1 className="font-semibold">{discussion.titre}</h1>
              <p className="text-xs opacity-80 flex items-center">
                {discussion.participants.length} participants
                <FaUsers className="ml-1" />
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowMedia(!showMedia)}
            className="p-2 rounded-full hover:bg-opacity-80"
            style={{ backgroundColor: `${currentTheme.primary}80` }}
          >
            <FaImage className="h-5 w-5" />
          </button>
          <div className="relative">
            <button 
              className="p-2 rounded-full hover:bg-opacity-80 options-button"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              style={{ backgroundColor: `${currentTheme.primary}80` }}
            >
              <BsThreeDotsVertical className="h-5 w-5" />
            </button>
            
            {showOptionsMenu && (
              <div 
                ref={optionsMenuRef}
                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
              >
                {discussionOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      option.action();
                      setShowOptionsMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#1a4edbb2]"
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search bar - toggleable */}
      {showSearch && (
        <div className={`p-2 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`flex items-center px-3 py-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <FaSearch className={`mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search in conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent focus:outline-none ${theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-800'}`}
            />
            <button 
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Participants list */}
      {showParticipants && (
        <div className={`p-4 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Participants</h3>
            <button 
              onClick={() => setShowParticipants(false)}
              className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FaTimes />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {discussion.participants.map((participant, index) => (
              <div 
                key={index} 
                className={`flex items-center p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center font-semibold"
                  style={{ backgroundColor: `${currentTheme.primary}20`, color: currentTheme.primary }}
                >
                  {participant.prenom.charAt(0)}
                </div>
                <div className="ml-3">
                  <div className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    {participant.prenom} {participant.nom}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {participant.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media section */}
      {showMedia && (
        <div className={`flex-1 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Discussion Media
            </h3>
            <div className="flex space-x-1">
              <button
                onClick={() => setMediaType("all")}
                className={`px-3 py-1 text-xs rounded-full ${mediaType === "all" ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setMediaType("images")}
                className={`px-3 py-1 text-xs rounded-full ${mediaType === "images" ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
              >
                Images
              </button>
              <button
                onClick={() => setMediaType("documents")}
                className={`px-3 py-1 text-xs rounded-full ${mediaType === "documents" ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
              >
                Documents
              </button>
            </div>
          </div>
          
          {isLoading.loadingMedia ? (
            <div className="flex justify-center items-center h-40">
              <div 
                className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
                style={{ borderColor: currentTheme.primary }}
              ></div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-40 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <FaImage className="text-3xl mb-2" />
              <p>No media found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 p-1">
              {filteredMedia.map((file, index) => (
                <div 
                  key={index} 
                  className="aspect-square bg-gray-100 relative overflow-hidden"
                >
                  {file.typeMIME.includes('image') ? (
                    <img 
                      src={`http://localhost:5000/uploads/${file.cheminFichier}`}
                      alt={file.nomFichier}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <FaFileAlt className="text-3xl text-gray-500" />
                    </div>
                  )}
                  <a
                    href={`http://localhost:5000/uploads/${file.cheminFichier}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all"
                  >
                    <FaSearch className="text-white opacity-0 hover:opacity-100" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages area */}
      {!showMedia && (
        <div className={`flex-1 overflow-y-auto p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
          {isLoading.messages && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div 
                className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
                style={{ borderColor: currentTheme.primary }}
              ></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-full ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="mb-4 text-xl">No messages found</div>
              <div className="text-sm">
                {searchQuery ? "No results for your search" : "Send your first message to start the conversation"}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMessages.map((message, index) => {
                const isCurrentUser = message.typeAuteur === currentUser.type && message.idAuteur === currentUser.id;
                const showDate = index === 0 || 
                  formatMessageDate(filteredMessages[index-1].dateEnvoi) !== formatMessageDate(message.dateEnvoi);
                const repliedMessage = message.idMessageRepondu ? getRepliedMessage(message.idMessageRepondu) : null;
                const isReply = message.content.startsWith('>> @');
                const replyInfo = isReply ? message.content.split('\n')[0] : null;
                const messageContent = isReply ? message.content.split('\n').slice(1).join('\n') : message.content;
                
                return (
                  <div key={message.idMessage} className="space-y-1">
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <div 
                          className={`text-xs px-2 py-1 rounded-full shadow ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'}`}
                          style={{ color: currentTheme.primary }}
                        >
                          {formatMessageDate(message.dateEnvoi)}
                        </div>
                      </div>
                    )}
                    
                    {editingMessageId === message.idMessage ? (
                      <div className="flex justify-end">
                        <div 
                          className="max-w-[80%] p-3 rounded-lg"
                          style={{ backgroundColor: currentTheme.messageOut }}
                        >
                          {repliedMessage && (
                            <div 
                              className="mb-2 pb-2 border-l-4 pl-2"
                              style={{ borderColor: currentTheme.primary }}
                            >
                              <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {repliedMessage.prenom || 'User'}
                              </div>
                              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                {repliedMessage.content.length > 30 
                                  ? `${repliedMessage.content.substring(0, 30)}...` 
                                  : repliedMessage.content}
                              </div>
                            </div>
                          )}
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className={`w-full p-2 rounded focus:outline-none focus:ring-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' : 'bg-white border-gray-300 focus:ring-blue-300'}`}
                            rows={3}
                            autoFocus
                          />
                          <div className="flex justify-end mt-2 space-x-2">
                            <button
                              onClick={() => setEditingMessageId(null)}
                              className={`px-3 py-1 text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveEdit}
                              disabled={isLoading.editing === message.idMessage}
                              className="px-3 py-1 text-sm text-white rounded hover:bg-opacity-90 disabled:opacity-50"
                              style={{ backgroundColor: currentTheme.primary }}
                            >
                              {isLoading.editing === message.idMessage ? (
                                <FaSpinner className="animate-spin inline mr-1" />
                              ) : null}
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          className={`max-w-[80%] p-2 rounded-lg relative ${isCurrentUser 
                            ? 'rounded-tr-none' 
                            : 'rounded-tl-none'}`}
                          style={{ 
                            backgroundColor: isCurrentUser ? currentTheme.messageOut : currentTheme.messageIn,
                            boxShadow: '0 1px 0.5px rgba(0,0,0,0.1)',
                          }}
                        >
                          <div 
                            className={`absolute top-0 w-3 h-3 ${isCurrentUser 
                              ? 'right-0 -mr-3' 
                              : 'left-0 -ml-3'}`}
                            style={{
                              backgroundColor: isCurrentUser ? currentTheme.messageOut : currentTheme.messageIn,
                              clipPath: isCurrentUser 
                                ? 'polygon(100% 0, 0% 100%, 100% 100%)' 
                                : 'polygon(0 0, 0% 100%, 100% 0)'
                            }}
                          ></div>

                          {!isCurrentUser && (
                            <div className={`font-semibold text-sm mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                              {message.prenom || 'User'}
                            </div>
                          )}

                          {isReply && (
                            <div 
                              className={`mb-1 pb-1 border-l-4 pl-2 ${theme === 'dark' ? 'border-gray-500' : 'border-gray-400'}`}
                            >
                              <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {replyInfo.split(':')[0].replace('>> @', '')}
                              </div>
                              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                {replyInfo.split(':')[1].trim()}
                              </div>
                            </div>
                          )}
                          
                          <div className={`whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                            {messageContent}
                          </div>
                          
                          {attachments[message.idMessage]?.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {attachments[message.idMessage].map(file => (
                                <div 
                                  key={file.idFichier} 
                                  className={`flex items-center justify-between p-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                >
                                  <a 
                                    href={`http://localhost:5000/uploads/${file.cheminFichier}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center hover:underline"
                                  >
                                    {getFileIcon(file.typeMIME)}
                                    <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                      {file.nomFichier}
                                    </span>
                                    <span className={`ml-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {formatFileSize(file.taille)}
                                    </span>
                                  </a>
                                  {isCurrentUser && (
                                    <button 
                                      onClick={() => handleDeleteFile(file.idFichier, message.idMessage)}
                                      className={`${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'} p-1`}
                                    >
                                      <FaTrash size={12} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex justify-end items-center mt-1 space-x-1">
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatTime(message.dateEnvoi)}
                            </span>
                            {isCurrentUser && (
                              <span className="text-xs" style={{ color: currentTheme.primary }}>
                                <FaCheckDouble />
                              </span>
                            )}
                          </div>
                          
                          <div className={`absolute ${isCurrentUser ? 'left-0 -translate-x-8' : 'right-0 translate-x-8'} top-1/2 transform -translate-y-1/2`}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMessage(selectedMessage === message.idMessage ? null : message.idMessage);
                              }}
                              className={`p-1 rounded-full hover:bg-opacity-20 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                            >
                              <BsThreeDotsVertical size={14} />
                            </button>
                            
                            {selectedMessage === message.idMessage && (
                              <div 
                                className={`absolute rounded-md shadow-lg py-1 z-50 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} w-40`}
                                style={{ 
                                  [isCurrentUser ? 'right' : 'left']: '100%',
                                  top: '50%',
                                  transform: 'translateY(-50%)'
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReplyingTo({
                                      idMessage: message.idMessage,
                                      prenom: message.prenom,
                                      content: messageContent
                                    });
                                    setSelectedMessage(null);
                                  }}
                                  className={`flex items-center w-full px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                  <FaReply className="mr-2" />
                                  Reply
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(messageContent);
                                    setSelectedMessage(null);
                                  }}
                                  className={`flex items-center w-full px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                  <FaCopy className="mr-2" />
                                  Copy
                                </button>
                                
                                {isCurrentUser && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(message);
                                        setSelectedMessage(null);
                                      }}
                                      className={`flex items-center w-full px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                      <FaEdit className="mr-2" />
                                      Edit
                                    </button>
                                    
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteMessage(message.idMessage);
                                        setSelectedMessage(null);
                                      }}
                                      className={`flex items-center w-full px-4 py-2 text-sm ${theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'}`}
                                    >
                                      <FaTrash className="mr-2" />
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      )}

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className={`p-2 border-t ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-200'}`}>
          <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Files to attach:
          </div>
          <div className="space-y-1">
            {selectedFiles.map((file, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}
              >
                <div className="flex items-center">
                  {getFileIcon(file.type)}
                  <span className={`ml-2 text-sm truncate max-w-xs ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    {file.name}
                  </span>
                  <span className={`ml-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                  className={`${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply preview */}
      {replyingTo && (
        <div 
          className={`p-2 border-l-4 flex items-start ${theme === 'dark' ? 'bg-gray-800 border-blue-500' : 'bg-gray-200 border-blue-400'}`}
        >
          <div className="flex-1">
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Replying to {replyingTo.prenom}
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {replyingTo.content.length > 50 
                ? `${repliedTo.content.substring(0, 50)}...` 
                : replyingTo.content}
            </div>
          </div>
          <button 
            onClick={() => setReplyingTo(null)}
            className={`ml-2 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Message input */}
      <div className={`p-3 border-t ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-2 z-[1000] emoji-picker">
            <EmojiPicker 
              onEmojiClick={handleEmojiClick}
              width={300}
              height={350}
              previewConfig={{ showPreview: false }}
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.mp3"
        />
        
        <div className="flex items-center">
          <button 
            className={`p-2 rounded-full hover:bg-opacity-20 emoji-button ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <BsEmojiSmile className="h-5 w-5" />
          </button>
          <button 
            className={`p-2 rounded-full hover:bg-opacity-20 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
            onClick={() => fileInputRef.current.click()}
          >
            <BsPaperclip className="h-5 w-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              setShowEmojiPicker(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={replyingTo 
              ? `Replying to ${replyingTo.prenom}...` 
              : "Type a message..."}
            className={`flex-1 mx-2 py-2 px-4 rounded-full focus:outline-none focus:ring-2 ${theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' : 'bg-gray-100 text-gray-800 focus:ring-blue-300'}`}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading.sending || isLoading.uploading || (!newMessage.trim() && selectedFiles.length === 0)}
            className={`p-2 rounded-full ${isLoading.sending || isLoading.uploading || (!newMessage.trim() && selectedFiles.length === 0)
              ? 'opacity-50 cursor-not-allowed'
              : ''}`}
            style={{ color: currentTheme.primary }}
          >
            {isLoading.sending || isLoading.uploading ? (
              <div 
                className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2"
                style={{ borderColor: currentTheme.primary }}
              ></div>
            ) : (
              <IoSend size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-xl shadow-lg w-96 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Confirm Deletion
            </h2>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete this message?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm({ show: false, messageId: null })}
                className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMessage}
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
};

export default Discussion;