// app/page.js
"use client";
import Dashboard from "./components/Dashboard";
import Sidebar from './components/sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

const DashboardContent = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu principal */}
      <div className="w-full flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Contenu du dashboard */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-4xl font-bold">GESTION DE PFE</h2>
            {user && (
              <div className="bg-[#b17a56]/10 p-2 rounded-lg">
                <span className="text-[#b17a56] font-medium">
                  Bienvenue, {user.prenom} {user.nom}
                </span>
              </div>
            )}
          </div>

          {/* Appel du composant Dashboard */}
          <Dashboard />
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  // Cette page est accessible à tous les rôles une fois connectés
  return (
    <ProtectedRoute allowedRoles={['etudiant', 'tuteur', 'encadrant', 'responsableFiliere']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}