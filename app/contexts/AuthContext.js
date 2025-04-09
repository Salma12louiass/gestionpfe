// app/contexts/AuthContext.js
"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Création du contexte
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider du contexte
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        setLoading(true);
        
        // Récupérer les informations de l'utilisateur du localStorage
        const userData = localStorage.getItem('user');
        
        if (!userData) {
          setLoading(false);
          return;
        }

        // Vérifier si le user est valide avec le serveur
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          // Si la session n'est plus valide, nettoyer le localStorage
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setUser(data.user || JSON.parse(userData));
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        // En cas d'erreur, on considère que l'utilisateur n'est pas connecté
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion');
      }

      // Stocker les informations de l'utilisateur dans le localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Mettre à jour l'état
      setUser(data.user);
      return data.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Même en cas d'erreur, on déconnecte l'utilisateur côté client
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };

  // Valeur à fournir via le contexte
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};