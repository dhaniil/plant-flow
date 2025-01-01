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

  useEffect(() => {
    // Fetch initial data from the backend with the full URL including the endpoint
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chart`);
        const result = await response.json();
        // Assuming your API returns initial data for the chart, adjust if necessary
        if (result.data && result.labels) {
          setData(result.data);
          setLabels(result.labels);
        }
      } catch (error) {
        console.error('Error fetching data from the backend:', error);
      }
    };

    fetchData();

    const client = mqtt.connect(MQTT_BROKER_URL);

    client.on('connect', () => {
      console.log(`Connected to MQTT broker, subscribing to topic: ${mqttTopic}`);
      client.subscribe(mqttTopic);
    });

    client.on('message', (receivedTopic, message) => {
      if (receivedTopic === mqttTopic) {
        const value = parseFloat(message.toString());
        const timestamp = new Date().toLocaleTimeString();

        setData((prevData) =>
          prevData.length >= 20 ? [...prevData.slice(1), value] : [...prevData, value]
        );
        setLabels((prevLabels) =>
          prevLabels.length >= 20 ? [...prevLabels.slice(1), timestamp] : [...prevLabels, timestamp]
        );
      }
    });

    return () => {
      client.unsubscribe(mqttTopic);
      client.end();
    };
  }, [mqttTopic]);

  const handleSave = () => {
    console.log('Saving chart with ID:', id);
    console.log('Updated data:', { name: chartName, topic: mqttTopic });
    
    onUpdate(id, {
      name: chartName,
      topic: mqttTopic
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 
      border border-green-100/50 ">
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
                onClick={() => setIsEditing(false)}
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
              <div className="flex ">
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
                  onClick={() => onDelete(id)}
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
        <div className="bg-white rounded-xl p-4 border border-green-100/50" 
          style={{ height: '400px' }}>
          <Line
            data={{
              labels: labels,
              datasets: [

              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {

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
              },
              interaction: {
                intersect: false,
                mode: 'index'
              },
              elements: {
                line: {
                  borderWidth: 2
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LineChart;
