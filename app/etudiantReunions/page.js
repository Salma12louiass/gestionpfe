// app/etudiantReunions/page.js
"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import EtudiantReunionsRouter from "./page-router";

export default function EtudiantReunionsPage() {
  // Protection de la page selon le rôle
  return (
    <ProtectedRoute allowedRoles={['etudiant', 'tuteur', 'encadrant', 'responsableFiliere']}>
      <EtudiantReunionsRouter />
    </ProtectedRoute>
  );
}