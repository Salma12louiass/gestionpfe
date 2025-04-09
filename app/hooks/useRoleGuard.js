// app/hooks/useRoleGuard.js
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook pour protéger les routes en fonction du rôle
 * @param {string[]} allowedRoles - Tableau des rôles autorisés
 * @param {string} redirectPath - Chemin de redirection si non autorisé (par défaut: '/')
 */
const useRoleGuard = (allowedRoles, redirectPath = '/') => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si le chargement est terminé et que l'utilisateur n'est pas authentifié
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Si le chargement est terminé, que l'utilisateur est authentifié, mais n'a pas le rôle requis
    if (!loading && isAuthenticated && user && !allowedRoles.includes(user.role)) {
      router.push(redirectPath);
    }
  }, [loading, isAuthenticated, user, allowedRoles, redirectPath, router]);

  return { isAuthorized: !loading && isAuthenticated && user && allowedRoles.includes(user.role) };
};

export default useRoleGuard;