// app/components/RedirectIfAuthenticated.jsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const RedirectIfAuthenticated = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Redirection basée sur le rôle
      if (user) {
        switch (user.role) {
          case 'etudiant':
            router.push('/');
            break;
          case 'tuteur':
            router.push('/');
            break;
          case 'encadrant':
            router.push('/');
            break;
          case 'responsableFiliere':
            router.push('/');
            break;
          default:
            router.push('/');
        }
      }
    }
  }, [isAuthenticated, loading, user, router]);

  // Afficher un écran de chargement si nécessaire
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b17a56] mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, afficher les enfants (page de connexion, etc.)
  if (!isAuthenticated) {
    return children;
  }

  // Pendant la redirection, afficher un écran de chargement
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b17a56] mx-auto"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">Redirection en cours...</p>
      </div>
    </div>
  );
};

export default RedirectIfAuthenticated;