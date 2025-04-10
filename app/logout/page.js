// app/logout/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        // La redirection vers /login est déjà gérée dans la fonction logout du contexte AuthContext
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        // En cas d'erreur, on redirige quand même vers la page de connexion
        router.push("/login");
      }
    };

    performLogout();
  }, [logout, router]);

  // Afficher un écran de chargement pendant la déconnexion
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b17a56] mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Déconnexion en cours...</h2>
      <p className="text-gray-600 dark:text-gray-400">Vous allez être redirigé vers la page de connexion.</p>
    </div>
  );
}