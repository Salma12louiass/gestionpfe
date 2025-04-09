// app/components/ProtectedRoute.jsx
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Vérifier l'authentification et l'autorisation
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        router.push('/');
      } else {
        setAuthorized(true);
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, router]);

  // Afficher un écran de chargement pendant la vérification
  if (loading || !authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b17a56] mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;