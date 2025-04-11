"use client";
import ProtectedRoute from "../components/ProtectedRoute";
import DiscussionsRouter from "./page-router";

export default function DiscussionsPage() {
  return (
    <ProtectedRoute allowedRoles={['etudiant', 'tuteur', 'encadrant', 'responsableFiliere']}>
      <DiscussionsRouter />
    </ProtectedRoute>
  );
}