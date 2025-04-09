//MON-PROJET/app/components/Dashboard.js
"use client";
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Group, FileUpload, CheckCircle, Cancel } from '@mui/icons-material';
import StatsCard from './StatsCard';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 15,       // Example data: 15 students
    submittedDeliverables: 15, // Updated to match your initial data
    validatedDeliverables: 0, // Updated to match your initial data
    rejectedDeliverables: 5,  // Updated to match your initial data
    pendingDeliverables: 1    // Added pending count
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch statistics
        const statsRes = await fetch('http://localhost:5000/api/dashboard/stats');
        const statsData = await statsRes.json();
        setStats(statsData);

        // Fetch chart data
        const chartRes = await fetch('http://localhost:5000/api/dashboard/deliverable-status');
        let chartData = await chartRes.json();
        
        chartData = chartData.map(item => ({
          name: item.name,
          'Livrables soumis': item.submitted,
          'Livrables validés': item.validated,
          'Livrables rejetés': item.rejected
        }));
        
        setChartData(chartData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Using example data if API fails
        setChartData([
          { name: '2023-10', 'Livrables soumis': 2, 'Livrables validés': 1, 'Livrables rejetés': 1 },
          { name: '2023-11', 'Livrables soumis': 3, 'Livrables validés': 2, 'Livrables rejetés': 0 }
        ]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Chargement des données...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Tableau de bord PFE</h2>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Étudiants" 
          value={stats.totalStudents}
          icon={<Group />}
          color="indigo"
        />
        <StatsCard 
          title="Livrables soumis" 
          value={stats.submittedDeliverables}
          icon={<FileUpload />}
          color="blue"
        />
        <StatsCard 
          title="Livrables validés" 
          value={stats.validatedDeliverables}
          icon={<CheckCircle />}
          color="green"
        />
        <StatsCard 
          title="Livrables rejetés" 
          value={stats.rejectedDeliverables}
          icon={<Cancel />}
          color="red"
        />
        {/* Add this if you want to show pending deliverables */}
     
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Progression des livrables</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Livrables soumis" 
                stroke="#3b82f6" // Blue-500
                strokeWidth={2}
                activeDot={{ r: 8, fill: '#3b82f6' }}
              />
              <Line 
                type="monotone" 
                dataKey="Livrables validés" 
                stroke="#10b981" // Green-500
                strokeWidth={2}
                activeDot={{ r: 8, fill: '#10b981' }}
              />
              <Line 
                type="monotone" 
                dataKey="Livrables rejetés" 
                stroke="#ef4444" // Red-500
                strokeWidth={2}
                activeDot={{ r: 8, fill: '#ef4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 