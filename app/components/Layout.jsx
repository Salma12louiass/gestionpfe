// components/Layout.jsx
"use client";
import Sidebar from "../components/Sidebar";
import Sidebar from "../components/Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}