// app/reunions/page.js
"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import ReunionsRouter from "./page-router";

export default function ReunionsPage() {
  // Protection de la page selon le rôle
  return (
    <ProtectedRoute allowedRoles={['etudiant', 'tuteur', 'encadrant', 'responsableFiliere']}>
      <ReunionsRouter />
    </ProtectedRoute>
  );
}