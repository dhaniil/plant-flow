import React, { useState } from 'react';
import axios from 'axios';

interface AddDeviceButtonProps {
  onAddDevice: (device: { id: string; name: string; topic: string; status: boolean }) => void;
}

const AddDeviceButton: React.FC<AddDeviceButtonProps> = ({ onAddDevice }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [mqttTopic, setMqttTopic] = useState('');
  const [status, setStatus] = useState(false);

  // Handle device submission and API call
  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/devices`, {
        id: deviceId,
        name: deviceName,
        topic: mqttTopic,
        status: status,
      });

      if (response.status === 200) {
        onAddDevice({
          id: deviceId,
          name: deviceName,
          topic: mqttTopic,
          status: status,
        });
        setIsModalOpen(false); // Close modal after successful submission
      } else {
        console.error('Error: Device not added');
      }
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  return (
    <>
      {/* Add Device Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Device
      </button>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Device</h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Device ID</label>
                <input
                  type="text"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full p-2 border rounded mt-2"
                  placeholder="Enter Device ID"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Device Name</label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full p-2 border rounded mt-2"
                  placeholder="Enter Device Name"
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <input
                  type="checkbox"
                  checked={status}
                  onChange={() => setStatus((prevStatus) => !prevStatus)}
                  className="mt-2"
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

export default AddDeviceButton;
