// app/components/Navbar.js
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaBell, FaEnvelope, FaUserCircle, FaUser, FaCog, FaPowerOff } from "react-icons/fa";
import { Badge, IconButton, Tooltip, Menu, MenuItem } from "@mui/material";
import { Notifications as NotificationsIcon, AccountCircle, Mail as MailIcon } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [anchorElMessages, setAnchorElMessages] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Nouveau projet assigné", description: "Vous avez été assigné au projet X.", date: "2025-02-13" },
    { id: 2, title: "Mise à jour de statut", description: "Le projet Y a été validé.", date: "2025-02-12" },
    { id: 3, title: "Date limite approchante", description: "La date limite de soumission pour le rapport est le 20 février.", date: "2025-02-10" },
  ]);
  const [messages, setMessages] = useState([
    { id: 1, from: "Prof. Ahmed", text: "Merci pour votre rapport" },
    { id: 2, from: "Admin", text: "Votre compte a été mis à jour" },
  ]);

  // Utiliser le hook d'authentification
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // S'assurer que l'utilisateur est connecté
        if (!user) return;
  
        let endpoint = '';
        if (user.role === 'etudiant') {
          endpoint = `notifications/etudiant/${user.id}`;
        } else if (user.role === 'tuteur') {
          endpoint = `notifications/tuteur/${user.id}`;
        } else if (user.role === 'encadrant') {
          endpoint = `notifications/encadrant/${user.id}`;
        } else if (user.role === 'responsableFiliere') {
          endpoint = `notifications/responsable/${user.id}`;
        }
  
        const response = await fetch(`http://localhost:5000/api/${endpoint}`);
        const data = await response.json();
        setNotifications(data);
        setNotifCount(data.filter(n => !n.isRead).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
  
    fetchNotifications();
  }, [user]);

  const handleClickNotif = (event) => setAnchorElNotif(event.currentTarget);
  const handleCloseNotif = () => setAnchorElNotif(null);

  const handleClickProfile = (event) => setAnchorElProfile(event.currentTarget);
  const handleCloseProfile = () => setAnchorElProfile(null);

  const handleClickMessages = (event) => setAnchorElMessages(event.currentTarget);
  const handleCloseMessages = () => setAnchorElMessages(null);

  // Handle logout
  const handleLogout = () => {
    logout();
    setAnchorElProfile(null);
  };

  return (
    <div className="flex justify-between items-center p-4 bg-[#b17a56] shadow-md">
      <h1 className="text-lg font-bold text-white"></h1>

      <div className="flex items-center gap-5">
        {/* User info - afficher le nom si disponible */}
        {user && (
          <div className="hidden md:block text-white">
            <span className="font-medium">{user.prenom} {user.nom}</span>
            <span className="text-xs ml-2 bg-white/20 px-2 py-1 rounded-full">
              {user.role === 'etudiant' ? 'Étudiant' : 
               user.role === 'encadrant' ? 'Encadrant' : 
               user.role === 'tuteur' ? 'Tuteur' : 'Responsable'}
            </span>
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleClickNotif}>
              <Badge badgeContent={notifCount} color="error">
                <NotificationsIcon className="text-white cursor-pointer text-xl hover:text-[#d1a689] transition" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorElNotif}
            open={Boolean(anchorElNotif)}
            onClose={handleCloseNotif}
            PaperProps={{
              className: "bg-[#b17a56] text-white",
            }}
          >
            {notifications.length === 0 ? (
              <MenuItem className="hover:bg-[#a06d4b]">Aucune notification</MenuItem>
            ) : (
              notifications.map((notif) => (
                <MenuItem key={notif.id} onClick={handleCloseNotif} className="hover:bg-[#a06d4b]">
                  <strong>{notif.title}</strong> <br />
                  {notif.description} <br />
                  <small>{notif.date}</small>
                </MenuItem>
              ))
            )}
          </Menu>
        </div>

        {/* Messages */}
        <div className="relative">
          <Tooltip title="Messages">
            <Link href="/discussions">
              <IconButton color="inherit">
                <Badge badgeContent={msgCount} color="primary">
                  <MailIcon className="text-white cursor-pointer text-xl hover:text-[#d1a689] transition" />
                </Badge>
              </IconButton>
            </Link>
          </Tooltip>

          <Menu
            anchorEl={anchorElMessages}
            open={Boolean(anchorElMessages)}
            onClose={handleCloseMessages}
            PaperProps={{
              className: "bg-[#b17a56] text-white",
            }}
          >
            {messages.length === 0 ? (
              <MenuItem className="hover:bg-[#a06d4b]">Aucun message</MenuItem>
            ) : (
              messages.map((msg) => (
                <MenuItem key={msg.id} onClick={handleCloseMessages} className="hover:bg-[#a06d4b]">
                  <strong>{msg.from}:</strong> {msg.text}
                </MenuItem>
              ))
            )}
          </Menu>
        </div>

        {/* Profil Menu */}
        <div className="relative">
          <Tooltip title="Compte">
            <IconButton onClick={handleClickProfile} color="inherit">
              <AccountCircle className="text-white cursor-pointer text-2xl hover:text-[#d1a689] transition" />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorElProfile}
            open={Boolean(anchorElProfile)}
            onClose={handleCloseProfile}
            PaperProps={{
              className: "bg-[#b17a56] text-white",
            }}
          >
            <MenuItem onClick={handleCloseProfile} className="hover:bg-[#a06d4b]">
              <Link href="/profil" className="flex items-center gap-2">
                <FaUser /> Mon Profil
              </Link>
            </MenuItem>
            <MenuItem onClick={handleCloseProfile} className="hover:bg-[#a06d4b]">
              <Link href="/parametres" className="flex items-center gap-2">
                <FaCog /> Paramètres
              </Link>
            </MenuItem>
            <MenuItem onClick={handleLogout} className="flex items-center gap-2 hover:bg-[#a06d4b]">
              <FaPowerOff /> Déconnexion
            </MenuItem>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;