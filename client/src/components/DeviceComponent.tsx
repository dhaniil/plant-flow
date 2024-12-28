// src/components/DeviceComponent.tsx
import React, { useState } from "react";

interface DeviceProps {
    deviceId: string;
    device_id: string;
    name: string;
    status: string;
    mqtt_topic: string;
    onUpdate: (id: string, updatedData: { name: string; status: string; mqtt_topic: string }) => void;
    onDelete: (id: string) => void;
}

const DeviceComponent: React.FC<DeviceProps> = ({ deviceId, device_id, name, status, mqtt_topic, onUpdate, onDelete }) => {
    const [editing, setEditing] = useState(false);
    const [editedName, setEditedName] = useState(name);
    const [editedStatus, setEditedStatus] = useState(status);
    const [editedMqttTopic, setEditedMqttTopic] = useState(mqtt_topic);

    const handleEditClick = () => setEditing(!editing);

    const handleSaveClick = () => {
        onUpdate(deviceId, { name: editedName, status: editedStatus, mqtt_topic: editedMqttTopic });
        setEditing(false);
    };

    const handleDeleteClick = () => {
        onDelete(deviceId);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs w-full">
            {editing ? (
                <>
                    <input
                        className="w-full p-2 border mb-2 rounded"
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                    />
                    <input
                        className="w-full p-2 border mb-2 rounded"
                        type="text"
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value)}
                    />
                    <input
                        className="w-full p-2 border mb-2 rounded"
                        type="text"
                        value={editedMqttTopic}
                        onChange={(e) => setEditedMqttTopic(e.target.value)}
                    />
                    <button onClick={handleSaveClick} className="bg-blue-500 text-white p-2 rounded w-full mt-2">Save</button>
                </>
            ) : (
                <>
                    <h3 className="font-bold text-xl">{device_id} - {name}</h3>
                    <p>Status: {status}</p>
                    <p>MQTT Topic: {mqtt_topic}</p>
                    <div className="flex gap-2 mt-4">
                        <button onClick={handleEditClick} className="bg-yellow-500 text-white p-2 rounded w-full">Edit</button>
                        <button onClick={handleDeleteClick} className="bg-red-500 text-white p-2 rounded w-full">Delete</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default DeviceComponent;
