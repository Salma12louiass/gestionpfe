// app/layout.js
"use client";
import { useEffect } from "react";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";

export default function RootLayout({ children }) {
  // Charger le thème au démarrage de l'application
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(savedTheme);
  }, []);

  return (
    <html lang="fr">
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}