// LineChart.tsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

interface LineChartProps {
  id: string;
  name: string;
  topic: string;
  onUpdate: (id: string, updatedData: { name: string; topic: string }) => void;
}

const LineChart: React.FC<LineChartProps> = ({ id, name, topic, onUpdate }) => {
  const [chartName, setChartName] = useState(name);
  const [mqttTopic, setMqttTopic] = useState(topic);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  // Simulasi Data Real-Time dari MQTT
  useEffect(() => {
    const simulateMQTTData = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const value = Math.floor(Math.random() * 100); // Random value
      setData((prevData) => (prevData.length >= 20 ? [...prevData.slice(1), value] : [...prevData, value]));
      setLabels((prevLabels) => (prevLabels.length >= 20 ? [...prevLabels.slice(1), timestamp] : [...prevLabels, timestamp]));
    });

    return () => clearInterval(simulateMQTTData);
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
            <button onClick={handleSave} className="bg-green-500 text-white px-2 py-1 rounded">Save</button>
            <button onClick={() => setIsEditing(false)} className="bg-red-500 text-white px-2 py-1 rounded">Cancel</button>
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
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
          },
        }}
      />
    </div>
  );
};

export default LineChart;
