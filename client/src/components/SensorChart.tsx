import React, { useState, useEffect } from 'react';
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

  // Update editTopic when sensorTopic changes
  useEffect(() => {
    setEditTopic(sensorTopic);
  }, [sensorTopic]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/datasensor/topic`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic: editTopic })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update topic');
      }

      onEditTopic(editTopic);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving topic:', error);
      alert('Gagal menyimpan topic. Silakan coba lagi.');
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Temperature & Humidity',
      },
    },
  };

  const data = {
    labels: sensorHistory.timestamps,
    datasets: [
      {
        label: 'Temperature',
        data: sensorHistory.temperatures,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Humidity',
        data: sensorHistory.humidities,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
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
                  placeholder={sensorTopic} // Use current topic as placeholder
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
                    setEditTopic(sensorTopic); // Reset to current topic
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