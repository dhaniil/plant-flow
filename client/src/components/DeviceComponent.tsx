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
        <div className="backdrop-blur-sm bg-white/30 p-6 rounded-xl shadow-lg max-w-xs w-full border border-white/20 hover:bg-white/40 transition-all duration-300">
            {editing ? (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nama Perangkat</label>
                        <input
                            className="w-full p-2.5 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <input
                            className="w-full p-2.5 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            type="text"
                            value={editedStatus}
                            onChange={(e) => setEditedStatus(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">MQTT Topic</label>
                        <input
                            className="w-full p-2.5 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            type="text"
                            value={editedMqttTopic}
                            onChange={(e) => setEditedMqttTopic(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleSaveClick} 
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition-colors duration-200"
                    >
                        Simpan
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-xl text-gray-800">{device_id}</h3>
                            <p className="text-gray-600 font-medium">{name}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleEditClick} className="text-gray-600 hover:text-green-500 transition-colors">
                                <i className="ri-edit-line text-xl"></i>
                            </button>
                            <button onClick={handleDeleteClick} className="text-gray-600 hover:text-red-500 transition-colors">
                                <i className="ri-delete-bin-line text-xl"></i>
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-gray-700">Status: <span className="font-medium">{status}</span></p>
                        <p className="text-gray-700">MQTT Topic: <span className="font-medium">{mqtt_topic}</span></p>
                    </div>
                </>
            )}
        </div>
    );
};

export default DeviceComponent;
