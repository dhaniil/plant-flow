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


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


interface LineChartProps {
  id: string;
  name: string;
  topic: string;
  onUpdate: (id: string, updatedData: { name: string; topic: string }) => void;
}

const MQTT_BROKER_URL = 'ws://broker.hivemq.com:8000/mqtt'; // Gunakan URL broker MQTT yang sesuai

const LineChart: React.FC<LineChartProps> = ({ id, name, topic, onUpdate }) => {
  const [chartName, setChartName] = useState(name);
  const [mqttTopic, setMqttTopic] = useState(topic);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
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
    onUpdate(id, { name: chartName, topic: mqttTopic });
    setIsEditing(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        {isEditing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
              placeholder="Chart Name"
              className="border p-1 rounded"
            />
            <input
              type="text"
              value={mqttTopic}
              onChange={(e) => setMqttTopic(e.target.value)}
              placeholder="MQTT Topic"
              className="border p-1 rounded"
            />
            <button onClick={handleSave} className="bg-green-500 text-white px-2 py-1 rounded">
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold">{chartName}</h3>
            <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:underline">
              Edit
            </button>
          </>
        )}
      </div>
      <div className="bg-white shadow rounded-lg p-4 mb-4" style={{ height: '400px', width: '100%' }}>
  <Line
    data={{
      labels: labels,
      datasets: [
        {
          label: 'Sensor Value',
          data: data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
      ],
    }}
    options={{
      responsive: true,
      maintainAspectRatio: false, // Pastikan ini false untuk menggunakan ukuran container
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
    }}
  />
</div>
    </div>
  );
};

export default LineChart;
