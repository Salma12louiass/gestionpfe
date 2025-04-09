// //MON-PROJET/app/components/StatsCard.jsx
import React from "react";

const StatsCard = ({ title, value, icon, color, className }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  return (
    <div className={`p-6 rounded-lg shadow ${colorClasses[color]} ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-white bg-opacity-30">
          {React.cloneElement(icon, { className: "text-2xl" })}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;