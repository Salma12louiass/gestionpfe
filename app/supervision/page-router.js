// app/supervision/page-router.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import OriginalSupervisionPage from "./OriginalPage";
import ProtectedRoute from "../components/ProtectedRoute";

// Composant pour gérer le routage selon le rôle de l'utilisateur
const SupervisionRouter = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur n'est pas un tuteur, rediriger vers supervisionprofEtudiant
    if (user && user.role !== 'tuteur') {
      router.push('/supervisionprofEtudiant');
    }
  }, [user, router]);

  // Si l'utilisateur est un tuteur, afficher l'interface originale avec le bouton "Ajouter un suivi"
  if (!user || user.role === 'tuteur') {
    return <OriginalSupervisionPage />;
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

export default SupervisionRouter;