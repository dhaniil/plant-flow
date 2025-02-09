import React, { useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";

interface AddChartButtonProps {
  onAddChart: (chart: { _id: string; name: string; topic: string }) => void;
}

const AddChartButton: React.FC<AddChartButtonProps> = ({ onAddChart }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartName, setChartName] = useState("");
  const [mqttTopic, setMqttTopic] = useState("");

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chart`, {
        name: chartName,
        topic: mqttTopic,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.sensor) {
        onAddChart(response.data.sensor);
      }

      setChartName("");
      setMqttTopic("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding chart:", error);
      alert("Gagal menambahkan chart");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-16 right-2 w-14 h-14 bg-green-500 text-white rounded-full 
          shadow-lg hover:bg-green-600 transition-all duration-300 
          flex items-center justify-center z-40
          hover:scale-110 active:scale-95
          hover:shadow-green-500/50"
      >
        <Plus size={24} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Chart</h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Chart Name</label>
                <input
                  type="text"
                  value={chartName}
                  onChange={(e) => setChartName(e.target.value)}
                  className="w-full p-2 border rounded mt-2"
                  placeholder="Enter Chart Name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">MQTT Topic</label>
                <input
                  type="text"
                  value={mqttTopic}
                  onChange={(e) => setMqttTopic(e.target.value)}
                  className="w-full p-2 border rounded mt-2"
                  placeholder="Enter MQTT Topic"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddChartButton; 