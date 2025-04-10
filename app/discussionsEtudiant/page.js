// app/discussionsEtudiant/page.js
"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import DiscussionsEtudiantRouter from "./page-router";

export default function DiscussionsEtudiantPage() {
  // Protection de la page selon le rôle
  return (
    <ProtectedRoute allowedRoles={['etudiant', 'tuteur', 'encadrant', 'responsableFiliere']}>
      <DiscussionsEtudiantRouter />
    </ProtectedRoute>
  );
}