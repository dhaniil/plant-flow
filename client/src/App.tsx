import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Menu, Bell, Droplet, Thermometer, Wind, TreesIcon as Plant, LogOut } from 'lucide-react'; // Import LogOut icon
import { useAdmin } from '../context/AdminContext';
import Header from './components/Header';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const sensorData = {
  labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
  datasets: [
    {
      
      label: 'Suhu (°C)',
      data: [22, 23, 25, 27, 26, 24],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.5)',
    },
    {
      label: 'Kelembaban (%)',
      data: [60, 62, 58, 55, 57, 59],
      borderColor: 'rgb(134, 239, 172)',
      backgroundColor: 'rgba(134, 239, 172, 0.5)',
    },
  ],
};

const options = {
  responsive: true,
  scales: {
    x: {
      type: 'category' as const,
    },
    y: {
      type: 'linear' as const,
      position: 'left' as const,
    },
  },
};

const plantStatus = [
  { name: 'Selada', status: 'Sehat', harvestDate: '15 Mei 2023' },
  { name: 'Bayam', status: 'Perlu Perhatian', harvestDate: '20 Mei 2023' },
  { name: 'Kangkung', status: 'Sehat', harvestDate: '18 Mei 2023' },
];

export default function HydroponicDashboard() {
  const { isAdmin, logout } = useAdmin();
  
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-green-100 font-Poppins">


      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <Thermometer size={48} className="text-green-500 mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Suhu</h2>
              <p className="text-3xl font-bold text-green-500">24°C</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <Droplet size={48} className="text-green-500 mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Kelembaban</h2>
              <p className="text-3xl font-bold text-green-500">60%</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <Wind size={48} className="text-green-500 mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Sirkulasi Udara</h2>
              <p className="text-3xl font-bold text-green-500">Normal</p>
            </div>
          </div>
        </div>

        {/* Sensor Data Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Sensor</h2>
          <Line data={sensorData} options={options} />
        </div>

        {/* Plant Status and Sensor History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plant Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Status Tanaman</h2>
            <div className="space-y-4">
              {plantStatus.map((plant, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Plant size={32} className="text-green-500 mr-4" />
                  <div>
                    <h3 className="font-semibold">{plant.name}</h3>
                    <p className={`text-sm ${plant.status === 'Sehat' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {plant.status}
                    </p>
                    <p className="text-sm text-gray-500">Panen: {plant.harvestDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sensor History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Riwayat Sensor</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-green-100">
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Suhu</th>
                    <th className="p-3">Kelembaban</th>
                  </tr>
                </thead>
                <tbody>
                  {sensorData.labels.map((time, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="p-3">{time}</td>
                      <td className="p-3">{sensorData.datasets[0].data[index]}°C</td>
                      <td className="p-3">{sensorData.datasets[1].data[index]}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
