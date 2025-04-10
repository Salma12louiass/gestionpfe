// app/supervision/page.js
"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import SupervisionRouter from "./page-router";
import { useAuth } from "../contexts/AuthContext";

export default function SupervisionPage() {
  // Protection de la page selon le rôle
  return (
    <ProtectedRoute allowedRoles={['etudiant', 'tuteur', 'encadrant', 'responsableFiliere']}>
      <SupervisionRouter />
    </ProtectedRoute>
  );
}