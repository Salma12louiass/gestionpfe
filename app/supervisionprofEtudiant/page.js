// app/supervisionprofEtudiant/page.js
"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import SupervisionProfRouter from "./page-router";

export default function SupervisionProfEtudiantPage() {
  // Protection de la page selon le rôle
  return (
    <ProtectedRoute allowedRoles={['etudiant', 'tuteur', 'encadrant', 'responsableFiliere']}>
      <SupervisionProfRouter />
    </ProtectedRoute>
  );
}