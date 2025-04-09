//MON-PROJET/app/page.js
import Dashboard from "./components/Dashboard";
import Sidebar from './components/sidebar';
import Navbar from './components/Navbar';
import Link from 'next/link';


export default function DashboardPage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu principal */}
      <div className="w-full flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Contenu du dashboard */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-4xl font-bold">GESTION DE PFE</h2>
          </div>

          {/* Appel du composant Dashboard */}
          <Dashboard />  {/* Ceci est la partie ajoutée */}
        </div>
      </div>
    </div>
  );
}
