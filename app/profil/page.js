// app/profil/page.js
"use client";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

const ProfilPage = () => {
  const router = useRouter();

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
        Mon Profil
      </h1>

      <div className="bg-white p-8 rounded-2xl shadow-lg dark:bg-gray-800">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl">
            <FaUser />
          </div>
          <div>
            <h2 className="text-2xl font-bold dark:text-white">Jean Dupont</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">jean.dupont@example.com</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Section Informations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">Informations personnelles</h3>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <FaEnvelope className="text-blue-500 dark:text-blue-400 text-2xl" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-800 dark:text-white">jean.dupont@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <FaPhone className="text-blue-500 dark:text-blue-400 text-2xl" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                <p className="text-gray-800 dark:text-white">+33 6 12 34 56 78</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <FaMapMarkerAlt className="text-blue-500 dark:text-blue-400 text-2xl" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                <p className="text-gray-800 dark:text-white">123 Rue de l'Exemple, 75001 Paris, France</p>
              </div>
            </div>
          </div>

          {/* Section Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">Actions</h3>
            <button className="w-full flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors">
              <FaEnvelope className="text-blue-500 dark:text-blue-400 text-2xl" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Modifier l'email</p>
                <p className="text-gray-800 dark:text-white">Mettez à jour votre adresse email</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors">
              <FaPhone className="text-blue-500 dark:text-blue-400 text-2xl" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Modifier le téléphone</p>
                <p className="text-gray-800 dark:text-white">Mettez à jour votre numéro de téléphone</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors">
              <FaMapMarkerAlt className="text-blue-500 dark:text-blue-400 text-2xl" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Modifier l'adresse</p>
                <p className="text-gray-800 dark:text-white">Mettez à jour votre adresse</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilPage;