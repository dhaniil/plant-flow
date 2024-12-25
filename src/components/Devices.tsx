import React, { useState } from "react";

interface DeviceProps {
  name: string;
  deviceId: string;
  mqttTopic: string;
  schedule: string[];
  isOnline: boolean;
  publishMessage: (topic: string, message: string) => void;
  onUpdate: (updatedDevice: {
    name: string;
    mqttTopic: string;
    schedule: string[];
  }) => void;
}

const DeviceCard: React.FC<DeviceProps> = ({
  name,
  deviceId,
  mqttTopic,
  schedule,
  isOnline,
  publishMessage,
  onUpdate,
}) => {
  const [isOn, setIsOn] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editedName, setEditedName] = useState(name);
  const [editedMqttTopic, setEditedMqttTopic] = useState(mqttTopic);
  const [editedSchedule, setEditedSchedule] = useState(schedule);
  const [newSchedule, setNewSchedule] = useState("");

  const toggleDevice = () => {
    const newState = !isOn;
    setIsOn(newState);
    publishMessage(mqttTopic, newState ? "ON" : "OFF");
  };

  const handleSave = () => {
    onUpdate({
      name: editedName,
      mqttTopic: editedMqttTopic,
      schedule: editedSchedule,
    });
    setShowEditModal(false);
  };

  const addNewSchedule = () => {
    if (newSchedule.trim()) {
      setEditedSchedule([...editedSchedule, newSchedule]);
      setNewSchedule("");
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 shadow-md bg-white">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p>
        <strong>Device ID:</strong> {deviceId}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        <span
          className={`font-bold ${
            isOnline ? "text-green-600" : "text-red-600"
          }`}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      </p>
      <div className="flex gap-4 mt-4">
        <button
          onClick={toggleDevice}
          className={`px-4 py-2 rounded-md text-white ${
            isOn ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {isOn ? "Turn Off" : "Turn On"}
        </button>
        <button
          onClick={() => setShowEditModal(true)}
          className="px-4 py-2 rounded-md text-white bg-blue-600"
        >
          Edit
        </button>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Device Settings</h3>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Name:</label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">MQTT Topic:</label>
              <input
                type="text"
                value={editedMqttTopic}
                onChange={(e) => setEditedMqttTopic(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Schedule:</label>
              <ul className="list-disc ml-4 mb-2">
                {editedSchedule.map((time, index) => (
                  <li key={index} className="flex items-center justify-between">
                    {time}
                    <button
                      onClick={() =>
                        setEditedSchedule(
                          editedSchedule.filter((_, i) => i !== index)
                        )
                      }
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
              <input
                type="time"
                value={newSchedule}
                onChange={(e) => setNewSchedule(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              />
              <button
                onClick={addNewSchedule}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md w-full"
              >
                Add Schedule
              </button>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md w-full"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceCard;
