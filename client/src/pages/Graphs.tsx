// Graphs.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LineChart from '../components/LineChart';


interface ChartData {
  id: string;
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
        const response = await axios.get(`${BACKEND_URL}/api/charts`);
        setCharts(response.data);
      } catch (error) {
        console.error('Error fetching charts:', error);
      }
    };
    fetchCharts();
  }, []);

  // Fungsi untuk Tambahkan Chart Baru
  const handleAddChart = async () => {
    if (!newChartName || !newChartTopic) {
      alert('Nama dan Topic Chart wajib diisi!');
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/chart`, {
        name: newChartName,
        topic: newChartTopic,
      });

      setCharts((prevCharts) => [...prevCharts, response.data.chart]);
      setNewChartName('');
      setNewChartTopic('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error menambahkan chart:', error);
      alert('Gagal menambahkan chart.');
    }
  };

  // Fungsi untuk Update Chart
  const handleUpdate = async (id: string, updatedData: { name: string; topic: string }) => {
    try {
      await axios.put(`${BACKEND_URL}/api/chart/${id}`, updatedData);
      setCharts((prevCharts) =>
        prevCharts.map((chart) => (chart.id === id ? { ...chart, ...updatedData } : chart))
      );
    } catch (error) {
      console.error('Error updating chart:', error);
      alert('Gagal memperbarui chart.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">IoT Monitoring Charts</h1>

      {/* Tambahkan Chart */}
      {isAdding ? (
        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <h2 className="text-lg font-bold mb-2">Tambah Chart Baru</h2>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Nama Chart"
              value={newChartName}
              onChange={(e) => setNewChartName(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="MQTT Topic"
              value={newChartTopic}
              onChange={(e) => setNewChartTopic(e.target.value)}
              className="border p-2 rounded"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddChart}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Tambahkan
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          Tambahkan Chart
        </button>
      )}

      {/* Daftar Charts */}
      {Array.isArray(charts) &&
        charts.map((chart) => (
          <LineChart
            key={chart.id}
            id={chart.id}
            name={chart.name}
            topic={chart.topic}
            onUpdate={handleUpdate}
          />
        ))}
    </div>
  );
};

export default Graphs;
