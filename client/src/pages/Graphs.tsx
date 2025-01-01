// Graphs.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LineChart from '../components/LineChart';
import AddChartButton from '../components/AddChartButton';
import { useAdmin } from '../../context/AdminContext';


interface ChartData {
  _id: string;
  name: string;
  topic: string;
}

// Baca URL backend dari .env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Graphs: React.FC = () => {
  const { isAdmin } = useAdmin();
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100/70 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-3">
      {/* Header Section - Adjusted padding and margins */}
      <div className="relative overflow-hidden mb-6 sm:mb-8">
        <div className="relative">
          <div className=" flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Grafik</h1>
              <p className="text-sm sm:text-base text-gray-600">Monitor data sensor dalam bentuk grafik</p>
            </div>
            {/* Stats Card */}
            <div className="flex gap-4 min-w-24">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-sm border border-green-100 w-full sm:w-auto">
                <p className="text-xs sm:text-sm text-green-600 mb-1 text-center">Grafik Aktif</p>
                <p className="text-xl sm:text-2xl font-semibold text-green-800 text-center">{charts.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid Section - Adjusted top spacing */}
      <div className="container mx-auto  pt-2">
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
      {isAdmin && (
        <AddChartButton onAddChart={handleAddChart} />
      )}
  
      {/* Decorative Elements */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300"></div>
      <div className="fixed top-0 left-0 w-1 h-screen bg-gradient-to-b from-green-300 via-emerald-300 to-teal-300"></div>
      </div>
    </div>
  );
};

export default Graphs;
