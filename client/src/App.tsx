import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Menu, Bell, Droplet, Thermometer, Wind, TreesIcon as Plant, LogOut, Settings, Save } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { ErrorBoundary } from './components/ErrorBoundary';



ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface NutrientData {
  id: string;
  name: string;
  value: number;
  topic: string;
  color: string;
  unit: string;
}

interface MQTTData {
  temperature: number | null;
  humidity: number | null;
  timestamp: number | null;
}

interface NutrientValue {
  ph: number | null;
  tds: number | null;
  ec: number | null;
  nutrient: number | null;
  timestamp: number | null;
}



const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Periksa apakah BACKEND_URL sudah benar
console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL); // Temporary debug

// Utility function untuk safe parsing JSON dengan pengecekan content type
const safeParseJSON = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    if (import.meta.env.DEV) {
      console.error('Invalid content type:', contentType);
    }
    throw new Error('Invalid response type');
  }

  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('JSON Parse Error:', text);
    }
    throw new Error('Invalid response format');
  }
};

export default function HydroponicDashboard() {
  const { isAdmin, logout } = useAdmin();
  
  const [sensorValues, setSensorValues] = useState({
    temperature: null,
    humidity: null
  });

  const [sensorHistory, setSensorHistory] = useState({
    temperatures: Array(6).fill(null),
    humidities: Array(6).fill(null),
    timestamps: Array(6).fill('')
  });

  // State untuk nutrient data
  const [nutrients, setNutrients] = useState<NutrientData[]>([]);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editTopic, setEditTopic] = useState('');
  const [sensorTopic, setSensorTopic] = useState('');
  const [isEditingTopic, setIsEditingTopic] = useState(false);

  const [mqttData, setMqttData] = useState<MQTTData>({
    temperature: null,
    humidity: null,
    timestamp: null
  });

  const [nutrientValues, setNutrientValues] = useState<NutrientValue>({
    ph: null,
    tds: null,
    ec: null,
    nutrient: null,
    timestamp: null
  });

  // Definisikan sensorData di dalam komponen
  const sensorData = {
    labels: sensorHistory.timestamps,
    datasets: [
      {
        label: 'Suhu (°C)',
        data: sensorHistory.temperatures.map(temp => temp ?? null),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        spanGaps: true,
      },
      {
        label: 'Kelembaban (%)',
        data: sensorHistory.humidities.map(hum => hum ?? null),
        borderColor: 'rgb(134, 239, 172)',
        backgroundColor: 'rgba(134, 239, 172, 0.5)',
        spanGaps: true,
      },
    ],
  };


  

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
      if (!BACKEND_URL) {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${BACKEND_URL}/api/nutrient/topics`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await safeParseJSON(response);
      if (data && Array.isArray(data.nutrients)) {
        setNutrients(data.nutrients);
      } else {
        throw new Error('Invalid data structure');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Gagal mengambil data nutrient:', error);
        console.error('Backend URL:', BACKEND_URL);
      }
      // Fallback ke empty array di production
      setNutrients([]);
    }
  };

  const updateNutrientTopic = async (id: string, topic: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/nutrient/topic/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await safeParseJSON(response);
      if (data && data.topic) {
        setNutrients(prev => prev.map(n => 
          n.id === id ? { ...n, topic: data.topic } : n
        ));
      } else {
        throw new Error('Invalid update response format');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Gagal mengupdate topic:', error);
      }
      // Rollback ke previous state di production
      setEditMode(null);
    }
  };

  // Tambahkan useEffect untuk mengambil data awal
  useEffect(() => {
    fetchNutrientTopics();
  }, []);

  // Fungsi untuk mengambil topic sensor
  const fetchSensorTopic = async () => {
    try {
      if (!BACKEND_URL) {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${BACKEND_URL}/api/datasensor/topic`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await safeParseJSON(response);
      if (data?.sensor?.topic) {
        setSensorTopic(data.sensor.topic);
      } else {
        throw new Error('Invalid topic data structure');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Gagal mengambil topic:', error);
      }
      setSensorTopic('hydro/sched/env');
    }
  };

  // Fungsi untuk update topic
  const updateSensorTopic = async (newTopic: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/datasensor/topic`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: newTopic }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await safeParseJSON(response);
      if (data?.sensor?.topic) {
        setSensorTopic(data.sensor.topic);
        setIsEditingTopic(false);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Gagal mengupdate topic:', error);
      }
    }
  };

  useEffect(() => {
    fetchSensorTopic();
  }, []);

  // Polling data sensor dari backend
  useEffect(() => {
    console.log('🚀 Memulai koneksi SSE ke:', `${BACKEND_URL}/api/datasensor/stream`);
    const eventSource = new EventSource(`${BACKEND_URL}/api/datasensor/stream`);
    console.log('🔌 Menghubungkan ke SSE...');
    
    eventSource.onopen = () => {
      console.log('🟢 Koneksi SSE terbuka');
      console.log('📡 Status koneksi:', eventSource.readyState);
    };
    
    eventSource.onmessage = (event) => {
      try {
        // Log raw data untuk debugging
        console.log('📥 [SSE] Raw data received:', {
          data: event.data,
          type: typeof event.data
        });
        
        // Validasi data mentah
        if (!event.data) {
          console.warn('⚠️ [SSE] Empty data received');
          return;
        }

        let parsedData;
        try {
          parsedData = JSON.parse(event.data);
        } catch (parseError) {
          console.error('❌ [SSE] JSON Parse error:', parseError);
          console.error('📄 [SSE] Invalid JSON data:', event.data);
          return;
        }

        // Validasi struktur data
        if (!parsedData || typeof parsedData !== 'object') {
          console.warn('⚠️ [SSE] Invalid data structure:', parsedData);
          return;
        }

        console.log('📊 [SSE] Successfully parsed data:', {
          timestamp: new Date().toISOString(),
          type: parsedData.type || 'sensor',
          data: parsedData
        });

        // Handle sensor data dengan validasi
        if (parsedData?.temperature !== undefined && parsedData?.humidity !== undefined) {
          // Validasi tipe data
          const temperature = Number(parsedData.temperature);
          const humidity = Number(parsedData.humidity);

          if (isNaN(temperature) || isNaN(humidity)) {
            console.warn('⚠️ [SENSOR] Invalid number values:', { temperature, humidity });
            return;
          }

          console.log('🌡️ [SENSOR] Updating values:', { temperature, humidity });
          
          setSensorValues({
            temperature,
            humidity
          });

          const currentTime = new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          });

          setSensorHistory(prev => ({
            temperatures: [...prev.temperatures.slice(1), temperature],
            humidities: [...prev.humidities.slice(1), humidity],
            timestamps: [...prev.timestamps.slice(1), currentTime]
          }));
        }

        // Handle nutrient data dengan validasi
        if (parsedData.type === 'nutrient') {
          if (!parsedData.id || parsedData.value === undefined) {
            console.warn('⚠️ [NUTRIENT] Missing required fields:', parsedData);
            return;
          }

          const value = Number(parsedData.value);
          if (isNaN(value)) {
            console.warn('⚠️ [NUTRIENT] Invalid value:', parsedData.value);
            return;
          }

          console.log('🧪 [NUTRIENT] Updating value:', {
            id: parsedData.id,
            value: value,
            timestamp: new Date(parsedData.timestamp).toLocaleString('id-ID')
          });

          setNutrients(prev => prev.map(nutrient => {
            if (nutrient.id === parsedData.id) {
              return {
                ...nutrient,
                value: value
              };
            }
            return nutrient;
          }));
        }
      } catch (error) {
        console.error('❌ [SSE] General error:', error);
        console.error('📄 [SSE] Raw data:', event.data);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ Koneksi SSE error:', error);
      // Coba reconnect setelah 5 detik
      setTimeout(() => {
        eventSource.close();
        new EventSource(`${BACKEND_URL}/api/datasensor/stream`);
      }, 5000);
    };

    return () => {
      console.log('🔴 Menutup koneksi SSE');
      eventSource.close();
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-green-100/70 font-Poppins">
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Summary Stats Cards */}
          <div className="animate-fade-in-slow grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              { 
                icon: Thermometer, 
                title: "Suhu", 
                value: sensorValues.temperature !== null 
                  ? `${sensorValues.temperature.toFixed(1)}°C`
                  : "-", 
                color: "white" 
              },
              { 
                icon: Droplet,  
                title: "Kelembaban", 
                value: sensorValues.humidity !== null 
                  ? `${sensorValues.humidity.toFixed(1)}%`
                  : "-", 
                color: "white" 
              },
            ].map((stat, idx) => (
              <div key={idx} 
                   className="bg-green-500 rounded-2xl p-6
                            border border-white/30 shadow-md
                            hover: transition-all duration-300
                            group">
                <div className="flex items-center">
                  <div className={`p-4 rounded-xl bg-green-200/40 mr-4
                                 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon size={32} className={`text-${stat.color}`} />
                  </div>
                  <div>
                    <h2 className="text-white font-medium">{stat.title}</h2>
                    <p className={`text-3xl font-bold text-${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sensor Data Chart */}
          <div className="bg-white/20 rounded-2xl p-4 sm:p-8 mb-8 
                        border border-white/30 shadow-lg animate-fade-in-slow">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-1 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-green-700">Data Sensor</h2>
              </div>
              
              {isAdmin && (
                <div className="relative flex items-center">
                  {isEditingTopic ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={sensorTopic}
                        onChange={(e) => setSensorTopic(e.target.value)}
                        className="px-3 py-2  rounded-lg bg-white/30 border border-green-500/30
                                 text-green-700 placeholder-green-600/50 text-sm"
                        placeholder="Topic MQTT"
                      />
                      <button
                        onClick={() => updateSensorTopic(sensorTopic)}
                        className="ml-2 p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30
                                 transition-colors duration-200"
                      >
                        <Save size={18} className="text-green-700" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingTopic(true)}
                      className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30
                               transition-colors duration-200"
                    >
                      <Settings size={18} className="text-green-700" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="h-[300px] sm:h-[400px]">
              <Line 
                data={{
                  labels: sensorHistory.timestamps,
                  datasets: [
                    {
                      label: 'Suhu (°C)',
                      data: sensorHistory.temperatures,
                      borderColor: 'rgb(34, 197, 94)',
                      backgroundColor: 'rgba(34, 197, 94, 0.5)',
                      spanGaps: true,
                    },
                    {
                      label: 'Kelembaban (%)',
                      data: sensorHistory.humidities,
                      borderColor: 'rgb(134, 239, 172)',
                      backgroundColor: 'rgba(134, 239, 172, 0.5)',
                      spanGaps: true,
                    },
                  ],
                }} 
                options={Option}
              />
            </div>
          </div>

          {/* Nutrient Stats and History Section */}
          <div className="animate-fade-in-slow grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Nutrient Status */}
            <div className="bg-white/20  rounded-2xl p-8 border border-white/30 shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2">
                  <div className="lg:h-8 sm:h-6 w-1 bg-gradient-to-b from-green-400 to-green-600 rounded-full  "></div>
                  <h2 className="lg:text-2xl font-bold text-green-700 sm:text-base">Status Nutrisi</h2>
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
                       className="group relative p-6 rounded-xl transition-all duration-300"
                       style={{
                         background: `linear-gradient(135deg, 
                           ${nutrient.color}70 0%, 
                           ${nutrient.color}50 100%
                         )`,
                         boxShadow: `0 8px 32px -4px ${nutrient.color}40`
                       }}>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full"
                               style={{ backgroundColor: nutrient.color }}></div>
                          <h3 className="text-xl font-bold text-white drop-shadow-md">
                            {nutrient.name}
                          </h3>
                        </div>

                        {isAdmin && (
                          <>
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
                          </>
                        )}
                      </div>

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

                      {isAdmin && editMode === nutrient.id && (
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
                    <tr className="border-b-2 border-green-500/30">
                      <th className="py-4 px-6 text-left text-green-700 font-semibold">Waktu</th>
                      <th className="py-4 px-6 text-left text-green-700 font-semibold">Suhu</th>
                      <th className="py-4 px-6 text-left text-green-700 font-semibold">Kelembaban</th>
                    </tr>
                  </thead>
                  <tbody>{sensorHistory.timestamps.map((time, index) => time && (
                    <tr key={index} className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors">
                      <td className="py-4 px-6 text-green-600 font-medium">{time}</td>
                      <td className="py-4 px-6 text-green-600">
                        {sensorHistory.temperatures[index] !== null 
                          ? `${sensorHistory.temperatures[index].toFixed(1)}°C`
                          : '-'}
                      </td>
                      <td className="py-4 px-6 text-green-600">
                        {sensorHistory.humidities[index] !== null
                          ? `${sensorHistory.humidities[index].toFixed(1)}%`
                          : '-'}
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

