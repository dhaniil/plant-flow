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

  // Tambahkan state untuk topic dan edit mode
  const [sensorTopic, setSensorTopic] = useState('');
  const [isEditingTopic, setIsEditingTopic] = useState(false);

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER_URL);
    
    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      nutrients.forEach(nutrient => {
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

  // Tambahkan fungsi untuk mengambil topic
  const fetchSensorTopic = async () => {
    try {
      console.log('Fetching sensor topic...');
      const response = await fetch('http://localhost:3000/api/datasensor/topic');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received data:', data);
      setSensorTopic(data.sensor.topic);
    } catch (error) {
      console.error('Gagal mengambil topic:', error);
    }
  };

  // Tambahkan fungsi untuk update topic
  const updateSensorTopic = async (newTopic: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/datasensor/topic', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: newTopic }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSensorTopic(data.sensor.topic);
      setIsEditingTopic(false);
    } catch (error) {
      console.error('Gagal mengupdate topic:', error);
    }
  };

  // Tambahkan useEffect untuk fetch topic
  useEffect(() => {
    fetchSensorTopic();
  }, []);

  return (
    <div className="min-h-screen bg-green-100/70 font-Poppins">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            { icon: Thermometer, title: "Suhu", value: "24°C", color: "green-500" },
            { icon: Droplet, title: "Kelembaban", value: "60%", color: "green-400" },

          ].map((stat, idx) => (
            <div key={idx} 
                 className="bg-white/20 backdrop-blur-md rounded-2xl p-6
                          border border-white/30 shadow-lg
                          hover:bg-white/30 transition-all duration-300
                          group">
              <div className="flex items-center">
                <div className={`p-4 rounded-xl bg-${stat.color}/10 mr-4
                               group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={32} className={`text-${stat.color}`} />
                </div>
                <div>
                  <h2 className="text-green-700/70 font-medium">{stat.title}</h2>
                  <p className={`text-3xl font-bold text-${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sensor Data Chart */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 mb-8
                      border border-white/30 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-1 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-green-700">Data Sensor</h2>
            </div>
            
            {/* Tambahkan tombol edit dan input topic */}
            <div className="flex items-center space-x-2">
              {isEditingTopic ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={sensorTopic}
                    onChange={(e) => setSensorTopic(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/30 border border-green-500/30
                             text-green-700 placeholder-green-600/50 text-sm"
                    placeholder="Masukkan topic MQTT"
                  />
                  <button
                    onClick={() => updateSensorTopic(sensorTopic)}
                    className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30
                             transition-colors duration-200"
                  >
                    <Save size={20} className="text-green-700" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingTopic(true)}
                  className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30
                           transition-colors duration-200"
                >
                  <Settings size={20} className="text-green-700" />
                </button>
              )}
            </div>
          </div>
          
          <Line data={sensorData} options={{
            ...options,
            plugins: {
              legend: {
                labels: {
                  color: '#15803d' // text-green-700
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(34, 197, 94, 0.1)' // green-500/10
                },
                ticks: {
                  color: '#15803d' // text-green-700
                }
              },
              y: {
                grid: {
                  color: 'rgba(34, 197, 94, 0.1)'
                },
                ticks: {
                  color: '#15803d'
                }
              }
            }
          }} />
        </div>

        {/* Nutrient Stats and History Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Nutrient Status */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8
                       border border-white/30 shadow-lg">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-1 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-green-700">Status Nutrisi</h2>
              </div>
              <div className="flex items-center space-x-2 bg-green-500/10 backdrop-blur px-4 py-1.5 
                            rounded-full border border-green-500/20">
                <div className="animate-pulse-slow w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-green-700 font-medium">Live Data</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nutrients.map((nutrient) => (
                <div key={nutrient.id} 
                     className="group relative p-6 rounded-xl transition-all  duration-300"
                     style={{
                       background: `linear-gradient(135deg, 
                         ${nutrient.color}70 0%, 
                         ${nutrient.color}50 100%
                       )`,
                       boxShadow: `0 8px 32px -4px ${nutrient.color}40`
                     }}>
                  {/* Header Section */}
                  <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full"
                               style={{ backgroundColor: nutrient.color }}></div>
                        <h3 className="text-xl font-bold text-white drop-shadow-md">
                            {nutrient.name}
                          </h3>
                      </div>

                      {/* Edit/Save Button */}
                      {editMode === nutrient.id ? (
                        <button onClick={() => handleSave(nutrient.id)}
                                className="p-3 rounded-xl transition-all duration-300
                                         bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                          <Save size={20} className="text-white drop-shadow-md" />
                        </button>
                      ) : (
                        <button onClick={() => handleEdit(nutrient.id, nutrient.topic)}
                                className="p-3 rounded-xl transition-all duration-300
                                         bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                          <Settings size={20} className="text-white drop-shadow-md" />
                        </button>
                      )}
                    </div>

                    {/* Value Display */}
                    <div className="mt-4 mb-6">
                      <div className="flex items-baseline">
                        <span className="text-6xl font-bold tracking-tighter text-white drop-shadow-lg">
                          {Number.isInteger(nutrient.value) ? 
                            Math.floor(nutrient.value) : 
                            nutrient.value?.toFixed(1) || '0'}
                        </span>
                        <span className="ml-2 text-lg font-medium text-white/90">
                          {nutrient.unit}
                        </span>
                      </div>
                    </div>



                      {/* Edit Topic Input */}
                      {editMode === nutrient.id && (
                        <div className="mt-4">
                          <input
                            type="text"
                            value={editTopic}
                            onChange={(e) => setEditTopic(e.target.value)}
                            className="w-full p-3 bg-black/30 border border-white/40 rounded-xl
                                     text-white placeholder-white/60 text-sm font-medium
                                     focus:ring-2 focus:ring-white/70 focus:border-transparent
                                     transition-all duration-200"
                            placeholder="Masukkan MQTT topic"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                
              ))}
            </div>
          </div>

          {/* Sensor History */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8
                       border border-white/30 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-8 w-1 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-green-700">Riwayat Sensor</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-green-500/20">
                    <th className="p-3 text-left text-green-700">Waktu</th>
                    <th className="p-3 text-left text-green-700">Suhu</th>
                    <th className="p-3 text-left text-green-700">Kelembaban</th>
                  </tr>
                </thead>
                <tbody>
                  {sensorData.labels.map((time, index) => (
                    <tr key={index} className="border-b border-green-500/10 
                                             hover:bg-green-500/5 transition-colors">
                      <td className="p-3 text-green-600">{time}</td>
                      <td className="p-3 text-green-600">{sensorData.datasets[0].data[index]}°C</td>
                      <td className="p-3 text-green-600">{sensorData.datasets[1].data[index]}%</td>
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

