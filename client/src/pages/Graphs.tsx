// Graphs.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LineChart from '../components/LineChart';
import AddChartButton from '../components/AddChartButton';


interface ChartData {
  _id: string;
  name: string;
  topic: string;
}

// Baca URL backend dari .env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Graphs: React.FC = () => {
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [newChartName, setNewChartName] = useState('');
  const [newChartTopic, setNewChartTopic] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Fetch Charts dari Database
  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/chart`);
        console.log('Response data:', response.data); // Debug: lihat data yang diterima
        setCharts(response.data);
      } catch (error) {
        console.error('Error fetching charts:', error);
      }
    };

    fetchCharts();
  }, []);

  // Fungsi untuk Tambahkan Chart Baru
  const handleAddChart = (newChart: { _id: string; name: string; topic: string }) => {
    setCharts((prevCharts) => [...prevCharts, newChart]);
  };

  // Fungsi untuk Update Chart
  const handleUpdate = async (id: string, updatedData: { name: string; topic: string }) => {
    if (!id) {
      console.error('ID tidak valid');
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/chart/${id}`,
        updatedData
      );
      
      if (response.data) {
        setCharts((prevCharts) =>
          prevCharts.map((chart) =>
            chart._id === id ? { ...chart, ...updatedData } : chart
          )
        );
      }
    } catch (error) {
      console.error('Error updating chart:', error);
      alert('Gagal mengupdate chart');
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      console.error('ID tidak valid');
      return;
    }

    try {
      // Hapus chart dari UI terlebih dahulu untuk UX yang lebih responsif
      setCharts((prevCharts) => prevCharts.filter(chart => chart._id !== id));
      
      // Kemudian lakukan delete di backend
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/chart/${id}`);
    } catch (error: any) {
      // Jika gagal, kembalikan state charts ke kondisi sebelumnya
      console.error('Error detail:', error.response || error);
      alert('Gagal menghapus chart');
      // Refresh halaman untuk memastikan data tetap sinkron
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50">
      {/* Header Section with Decorative Elements */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/leaf-pattern.png')] opacity-5"></div>
        <div className="container mx-auto px-6 py-8 relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-green-800 tracking-tight mb-2">
                IoT Monitoring Charts
              </h1>
              <p className="text-green-600/80 text-sm">
                Real-time hydroponic system monitoring dashboard
              </p>
            </div>
            {/* Optional: Add summary stats here */}
            <div className="flex gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-green-100">
                <p className="text-sm text-green-600 mb-1">Active Sensors</p>
                <p className="text-2xl font-semibold text-green-800">{charts.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid Section */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 gap-6">
          {charts?.map((chart, index) => (
            <LineChart
              key={`${chart._id}-${index}`}
              id={chart._id}
              name={chart.name}
              topic={chart.topic}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Floating Add Button */}
      <AddChartButton onAddChart={handleAddChart} />

      {/* Decorative Elements */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300"></div>
      <div className="fixed top-0 left-0 w-1 h-screen bg-gradient-to-b from-green-300 via-emerald-300 to-teal-300"></div>
    </div>
  );
};

export default Graphs;
