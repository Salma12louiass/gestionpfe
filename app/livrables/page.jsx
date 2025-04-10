// app/livrables/page.jsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import LivrablesContent from "./LivrablesContent";
import ProtectedRoute from "../components/ProtectedRoute";

// Composant pour gérer le routage selon le rôle de l'utilisateur
const LivrablesRouter = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur est un tuteur ou un encadrant, rediriger vers la page professeur-tuteur-Livrables
    if (user && (user.role === 'tuteur' || user.role === 'encadrant')) {
      router.push('/professeur-tuteur-Livrables');
    }
  }, [user, router]);

  // Si l'utilisateur est un étudiant ou responsableFiliere, afficher le contenu normal
  if (!user || (user.role !== 'tuteur' && user.role !== 'encadrant')) {
    return <LivrablesContent />;
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

export default function LivrablesPage() {
  // Protection de la page selon le rôle
  return (
    <ProtectedRoute allowedRoles={['etudiant', 'tuteur', 'encadrant', 'responsableFiliere']}>
      <LivrablesRouter />
    </ProtectedRoute>
  );
}