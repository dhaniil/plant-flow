import React, { useState } from 'react';
import { Settings, Save, X } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAdmin } from '../../context/AdminContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SensorChartProps {
  sensorHistory: {
    temperatures: Array<number | null>;
    humidities: Array<number | null>;
    timestamps: string[];
  };
  sensorTopic: string;
  onEditTopic: (topic: string) => void;
}

const SensorChart: React.FC<SensorChartProps> = ({ 
  sensorHistory,
  sensorTopic,
  onEditTopic
}) => {
  const { isAdmin } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [editTopic, setEditTopic] = useState(sensorTopic);

  const handleSave = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/datasensor/${sensorTopic}`, {
            method: "PUT", 
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ topic: editTopic }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        onEditTopic(editTopic); // Update state di parent component
        setIsEditing(false);
        alert(result.message);
    } catch (error) {
        console.error("Error saving sensor topic:", error);
        alert("Gagal menyimpan topic sensor. Silakan coba lagi.");
    }
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          usePointStyle: true,
          padding: 20,
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          family: "'Inter', sans-serif"
        },
        titleFont: {
          family: "'Inter', sans-serif"
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif"
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif"
          }
        }
      }
    }
  };

  const data = {
    labels: sensorHistory.timestamps,
    datasets: [
      {
        label: 'Suhu (°C)',
        data: sensorHistory.temperatures,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Kelembaban (%)',
        data: sensorHistory.humidities,
        borderColor: 'rgb(134, 239, 172)',
        backgroundColor: 'rgba(134, 239, 172, 0.5)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: true
      }
    ]
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Sensor Data</h3>
        {isAdmin && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-white 
                           text-gray-800 border border-gray-300
                           placeholder-gray-500 focus:outline-none 
                           focus:ring-2 focus:ring-green-500
                           text-sm w-40"
                  placeholder={sensorTopic}
                />
                <button 
                  onClick={handleSave}
                  className="p-1.5 bg-green-500 text-white rounded-lg 
                            hover:bg-green-600"
                >
                  <Save size={14} />
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditTopic(sensorTopic);
                  }}
                  className="p-1.5 bg-red-500 text-white rounded-lg 
                            hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <Settings size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      <Line options={options} data={data} />

      {isAdmin && !isEditing && (
        <div className="mt-2 text-sm text-gray-500">
          Topic: {sensorTopic}
        </div>
      )}
    </div>
  );
};

export default React.memo(SensorChart);