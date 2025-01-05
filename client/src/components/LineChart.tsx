import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import mqtt from 'mqtt';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAdmin } from '../../context/AdminContext';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  id: string;
  name: string;
  topic: string;
  onUpdate: (id: string, updatedData: { name: string; topic: string }) => void;
  onDelete: (id: string) => void;
}

const MQTT_BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL;

const LineChart: React.FC<LineChartProps> = ({ id, name, topic, onUpdate, onDelete }) => {
  const { isAdmin } = useAdmin();
  const [chartName, setChartName] = useState(name);
  const [mqttTopic, setMqttTopic] = useState(topic);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [currentValue, setCurrentValue] = useState<number | null>(null);

  // Polling data dari MQTT
  useEffect(() => {
    const fetchMqttData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/mqtt/data/${encodeURIComponent(topic)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error('Response not OK:', response.status, response.statusText);
          throw new Error('Failed to fetch MQTT data');
        }
        
        const result = await response.json();
        console.log('MQTT Data received:', result); // Debugging

        if (result && result.value !== null && result.value !== undefined) {
          const numericValue = parseFloat(result.value);
          if (!isNaN(numericValue)) {
            setCurrentValue(numericValue);
            const time = new Date().toLocaleTimeString();
            
            setData(prevData => {
              const newData = [...prevData, numericValue];
              if (newData.length > 10) newData.shift();
              return newData;
            });
            
            setLabels(prevLabels => {
              const newLabels = [...prevLabels, time];
              if (newLabels.length > 10) newLabels.shift();
              return newLabels;
            });
          }
        }
      } catch (error) {
        console.error('Error fetching MQTT data:', error);
      }
    };

    fetchMqttData();
    const interval = setInterval(fetchMqttData, 1000);
    return () => clearInterval(interval);
  }, [topic]);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: chartName,
        data: data,
        fill: false,
        borderColor: 'rgb(22, 163, 74)',
        backgroundColor: 'rgba(22, 163, 74, 0.5)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(22, 163, 74)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          color: '#166534'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif",
          weight: 600
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif"
        },
        borderColor: 'rgba(22, 163, 74, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(22, 163, 74, 0.1)'
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: '#166534'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: '#166534',
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const handleSave = async () => {
    try {
      // Panggil fungsi onUpdate yang diterima dari props
      await onUpdate(id, {
        name: chartName,
        topic: mqttTopic
      });
      
      // Jika berhasil, keluar dari mode editing
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving chart:', error);
      alert('Gagal menyimpan perubahan');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus chart ini?')) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting chart:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-100/50">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          {isEditing ? (
            <div className="flex gap-3 w-full">
              <input
                type="text"
                value={chartName}
                onChange={(e) => setChartName(e.target.value)}
                placeholder="Chart Name"
                className="border border-green-200 p-2 rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-green-500 flex-1 bg-green-50/30"
              />
              <input
                type="text"
                value={mqttTopic}
                onChange={(e) => setMqttTopic(e.target.value)}
                placeholder="MQTT Topic"
                className="border border-green-200 p-2 rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-green-500 flex-1 bg-green-50/30"
              />
              <button 
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg
                  transition duration-200 ease-in-out shadow-lg hover:shadow-green-200"
              >
                Simpan
              </button>
              <button
                onClick={() => {
                  setChartName(name); // Reset ke nilai awal
                  setMqttTopic(topic); // Reset ke nilai awal
                  setIsEditing(false);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg
                  transition duration-200 ease-in-out shadow-lg hover:shadow-gray-200"
              >
                Batal
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-row sm:flex-col sm:items-start lg:flex-row items-center lg:gap-4 gap-1">
                <h3 className="text-xl font-bold text-green-800 tracking-tight">{chartName}</h3>
                {isAdmin && (
                <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm
                  font-medium border border-green-200/50 shadow-sm">
                  {mqttTopic}
                </span>
                )}
              </div>
              <div className="flex">
                {isAdmin && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="text-gray-600 hover:text-green-500 transition-colors p-2.5
                    hover:bg-green-50 rounded-full border border-transparent
                    hover:border-green-200/50 shadow-sm"
                >
                  <i className="ri-edit-line text-xl"></i>
                </button>
                )}
                {isAdmin && (
                <button 
                  onClick={handleDelete}
                  className="text-gray-600 hover:text-red-500 transition-colors p-2.5
                    hover:bg-red-50 rounded-full border border-transparent
                    hover:border-red-200/50 shadow-sm"
                >
                  <i className="ri-delete-bin-line text-xl"></i>
                </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl p-4 border border-green-100/50" style={{ height: '400px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default LineChart;
