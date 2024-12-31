import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Menu, Bell, Droplet, Thermometer, Wind, TreesIcon as Plant, LogOut, Settings, Save } from 'lucide-react'; // Import LogOut icon
import { useAdmin } from '../context/AdminContext';
import Header from './components/Header';
import Cuaca from './components/Cuaca';

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

// Tambahkan interface untuk nutrient data
interface NutrientData {
  id: string;
  name: string;
  value: number;
  topic: string;
  color: string;
  unit: string;
}

export default function HydroponicDashboard() {
  const { isAdmin, logout } = useAdmin();
  
  // State untuk nutrient data
  const [nutrients, setNutrients] = useState<NutrientData[]>([]);
  
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editTopic, setEditTopic] = useState('');
  
  // Update MQTT setup
  const MQTT_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER_URL);
    
    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      nutrients.forEach(nutrient => {
        console.log(`Subscribing to topic: ${nutrient.topic}`);
        client.subscribe(nutrient.topic);
      });
    });

    client.on('error', (err) => {
      console.error('MQTT connection error:', err);
    });

    client.on('message', (topic, message) => {
      console.log(`Received message from ${topic}:`, message.toString());
      setNutrients(prev => prev.map(nutrient => {
        if (nutrient.topic === topic) {
          const value = parseFloat(message.toString());
          if (!isNaN(value)) {
            return { ...nutrient, value };
          }
        }
        return nutrient;
      }));
    });

    return () => {
      console.log('Disconnecting MQTT client');
      if (client.connected) {
        nutrients.forEach(nutrient => {
          client.unsubscribe(nutrient.topic);
        });
        client.end();
      }
    };
  }, [nutrients]);

  const handleEdit = (id: string, topic: string) => {
    setEditMode(id);
    setEditTopic(topic);
  };

  const handleSave = async (id: string) => {
    await updateNutrientTopic(id, editTopic);
    setEditMode(null);
  };

  const handleLogout = () => {
    logout();
  };

  // Tambahkan fungsi untuk mengambil dan update topic
  const fetchNutrientTopics = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/nutrient/topics');
      const data = await response.json();
      setNutrients(data.nutrients);
    } catch (error) {
      console.error('Gagal mengambil data nutrient:', error);
    }
  };

  const updateNutrientTopic = async (id: string, topic: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/nutrient/topic/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      if (response.ok) {
        const updatedNutrient = await response.json();
        setNutrients(prev => prev.map(n => 
          n.id === id ? { ...n, topic: updatedNutrient.topic } : n
        ));
      }
    } catch (error) {
      console.error('Gagal mengupdate topic:', error);
    }
  };

  // Tambahkan useEffect untuk mengambil data awal
  useEffect(() => {
    fetchNutrientTopics();
  }, []);

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
          {/* Nutrient Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Status Nutrisi</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nutrients.map((nutrient) => (
                <div key={nutrient.id} 
                     className="relative p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">{nutrient.name}</h3>
                      <p className={`text-2xl font-bold text-${nutrient.color}-500`}>
                        {nutrient.value}{nutrient.unit}
                      </p>
                    </div>
                    {editMode === nutrient.id ? (
                      <button
                        onClick={() => handleSave(nutrient.id)}
                        className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                      >
                        <Save size={18} className="text-green-600" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(nutrient.id, nutrient.topic)}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Settings size={18} className="text-gray-600" />
                      </button>
                    )}
                  </div>
                  
                  {editMode === nutrient.id ? (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={editTopic}
                        onChange={(e) => setEditTopic(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Masukkan MQTT topic"
                      />
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: nutrient.color,
                            width: `${(nutrient.value / getMaxValue(nutrient.id)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
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

// Helper function untuk menentukan nilai maksimum untuk progress bar
function getMaxValue(id: string): number {
  switch (id) {
    case 'ph': return 14;
    case 'tds': return 1500;
    case 'ec': return 3;
    case 'nutrient': return 10;
    default: return 100;
  }
}
