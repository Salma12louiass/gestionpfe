// app/discussions/page.js
"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import DiscussionsRouter from "./page-router";

export default function DiscussionsPage() {
  // Protection de la page selon le rôle
  return (
    <ProtectedRoute allowedRoles={['etudiant', 'tuteur', 'encadrant', 'responsableFiliere']}>
      <DiscussionsRouter />
    </ProtectedRoute>
  );
}