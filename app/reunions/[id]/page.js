//MON-PROJET/app/reunions/[id]/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const ReunionDetails = () => {
  const params = useParams();
  const router = useRouter();
  const [reunion, setReunion] = useState(null);
  const [commentaires, setCommentaires] = useState("");

  useEffect(() => {
    const fetchReunion = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/reunions/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Réunion non trouvée");
          } else {
            throw new Error("Erreur lors de la récupération de la réunion");
          }
        }
        const data = await response.json();
        setReunion(data);
        setCommentaires(data.commentaires || "");
      } catch (error) {
        console.error("Erreur lors de la récupération de la réunion:", error);
        setReunion(null);
      }
    };
    fetchReunion();
  }, [params.id]);

  const handleSaveCommentaires = async () => {
    try {
      await fetch(`http://localhost:5000/api/reunions/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentaires }),
      });
      alert("Commentaires enregistrés avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des commentaires:", error);
    }
  };

  if (!reunion) {
    return <div className="p-6 text-red-500">Réunion non trouvée</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <nav className="bg-white shadow-md p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-[#b17a56] text-white rounded-lg hover:bg-[#b17a56]/90 transition"
          >
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800 flex-grow text-center mx-4">
            📝 Détails de la Réunion
          </h1>
        </div>
      </nav>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">{reunion.sujet}</h2>
            <p className="text-gray-600 mt-2">📅 {reunion.date} {reunion.heure}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">👥 Participants</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                {reunion.participants}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">📒 Agenda</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                {reunion.agenda}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">💬 Commentaires</h3>
            <textarea
              placeholder="Ajouter un commentaire..."
              value={commentaires}
              onChange={(e) => setCommentaires(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b17a56] focus:border-transparent"
              rows="4"
            />
            <button
              onClick={handleSaveCommentaires}
              className="mt-4 bg-[#b17a56] text-white px-6 py-2 rounded-lg hover:bg-[#b17a56]/90 transition-all float-right"
            >
              Enregistrer les commentaires
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReunionDetails;