// app/parametres/page.js
"use client";
import { useState, useEffect } from "react";
import { FaBell, FaPalette, FaLock, FaArrowLeft, FaSun, FaMoon } from "react-icons/fa";
import { useRouter } from "next/navigation";

const ParametresPage = () => {
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: true,
    theme: "light", // Par défaut, le thème est clair
  });

  // Charger le thème depuis le localStorage au montage du composant
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setSettings((prev) => ({ ...prev, theme: savedTheme }));
  }, []);

  // Appliquer le thème à l'ensemble de l'application
  const applyTheme = (theme) => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  };

  const handleChangeTheme = (theme) => {
    setSettings({ ...settings, theme });
    applyTheme(theme); // Appliquer le thème immédiatement
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen dark:from-gray-900 dark:to-gray-800">
      {/* Bouton Retour */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-transform transform hover:-translate-x-1"
      >
        <FaArrowLeft /> Retour
      </button>

      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
        Paramètres
      </h1>

      <div className="bg-white p-8 rounded-2xl shadow-lg space-y-8 dark:bg-gray-800">
        {/* Thème */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg dark:bg-blue-900">
              <FaPalette className="text-blue-600 dark:text-blue-400 text-2xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold dark:text-white">Thème</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Personnalisez l'apparence de l'application</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleChangeTheme("light")}
              className={`p-2 rounded-full transition-colors ${
                settings.theme === "light" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              <FaSun />
            </button>
            <button
              onClick={() => handleChangeTheme("dark")}
              className={`p-2 rounded-full transition-colors ${
                settings.theme === "dark" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              <FaMoon />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg dark:bg-green-900">
              <FaBell className="text-green-600 dark:text-green-400 text-2xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold dark:text-white">Notifications</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Activez ou désactivez les notifications</p>
            </div>
          </div>
          {/* Toggle Switch personnalisé */}
          <button
            onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
            className={`relative w-11 h-6 rounded-full p-1 transition-colors ${
              settings.notifications ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            <span
              className={`block w-4 h-4 bg-white rounded-full transform transition-transform ${
                settings.notifications ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Changer le mot de passe */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg dark:bg-red-900">
              <FaLock className="text-red-600 dark:text-red-400 text-2xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold dark:text-white">Mot de passe</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mettez à jour votre mot de passe</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Changer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParametresPage;