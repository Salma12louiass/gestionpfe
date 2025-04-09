import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

export default function AffectationPage() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      <div className="w-full">
        {/* Navbar */}
        <Navbar />

        {/* Contenu Principal */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 min-h-screen">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Page Affectation</h1>
        </div>
      </div>
    </div>
  );
}