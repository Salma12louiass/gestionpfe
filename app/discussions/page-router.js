// app/discussions/page-router.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import OriginalDiscussionsPage from "./OriginalPage";
import ProtectedRoute from "../components/ProtectedRoute";

// Composant pour gérer le routage selon le rôle de l'utilisateur
const DiscussionsRouter = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur est un étudiant, rediriger vers discussionsEtudiant
    if (user && user.role === 'etudiant') {
      router.push('/discussionsEtudiant');
    }
  }, [user, router]);

  // Si l'utilisateur est un tuteur, encadrant ou responsable, afficher l'interface originale
  if (!user || (user.role !== 'etudiant')) {
    return <OriginalDiscussionsPage />;
  }

  // Pendant la redirection (pour éviter un flash de contenu)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b17a56] mx-auto"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">Redirection en cours...</p>
      </div>
    </div>
  );
};

export default DiscussionsRouter;