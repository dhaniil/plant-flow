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

    const handleEditClick = () => {
        setEditing(true);
        // Mencegah scroll saat modal terbuka
        document.body.style.overflow = 'hidden';
    };

    const handleSaveClick = () => {
        onUpdate(deviceId, { name: editedName, status: editedStatus, mqtt_topic: editedMqttTopic });
        setEditing(false);
        // Mengembalikan scroll saat modal tertutup
        document.body.style.overflow = 'unset';
    };

    const handleCloseModal = () => {
        setEditing(false);
        // Mengembalikan scroll saat modal tertutup
        document.body.style.overflow = 'unset';
    };

    const handleDeleteClick = () => {
        onDelete(deviceId);
        
    };

    return (
        <>
            {/* Modal Edit */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay dengan blur */}
                    <div 
                        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative z-50 w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl
                        border border-white/20 backdrop-blur-xl bg-white/90
                        transform transition-all duration-300 scale-100 animate-fade-in-fast">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Edit Perangkat</h3>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Nama Perangkat</label>
                                <input
                                    className="w-full p-2.5 bg-white/60 border border-gray-200 rounded-lg 
                                        focus:ring-2 focus:ring-green-500 focus:border-transparent 
                                        transition-all duration-200"
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <input
                                    className="w-full p-2.5 bg-white/60 border border-gray-200 rounded-lg 
                                        focus:ring-2 focus:ring-green-500 focus:border-transparent 
                                        transition-all duration-200"
                                    type="text"
                                    value={editedStatus}
                                    onChange={(e) => setEditedStatus(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">MQTT Topic</label>
                                <input
                                    className="w-full p-2.5 bg-white/60 border border-gray-200 rounded-lg 
                                        focus:ring-2 focus:ring-green-500 focus:border-transparent 
                                        transition-all duration-200"
                                    type="text"
                                    value={editedMqttTopic}
                                    onChange={(e) => setEditedMqttTopic(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleSaveClick} 
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium 
                                    py-2.5 rounded-lg transition-all duration-200 
                                    hover:shadow-lg hover:shadow-green-500/30"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Card Device */}
            <div className="backdrop-blur-xl bg-white/40 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                max-w-xs w-full border border-white/40 hover:bg-white/50 
                transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)]
                hover:scale-[1.02] hover:border-white/60">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-600 font-medium">{name}</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleEditClick} 
                            className="text-gray-600 hover:text-green-500 transition-colors p-2 
                                hover:bg-green-50 rounded-full"
                        >
                            <i className="ri-edit-line text-xl"></i>
                        </button>
                        <button 
                            onClick={handleDeleteClick} 
                            className="text-gray-600 hover:text-red-500 transition-colors p-2 
                                hover:bg-red-50 rounded-full"
                        >
                            <i className="ri-delete-bin-line text-xl"></i>
                        </button>
                    </div>
                </div>
                <div className="space-y-3 mt-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <p className="text-gray-700">Status: 
                            <span className="font-medium ml-2">{status}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-gray-700">MQTT Topic: 
                            <span className="font-medium ml-2">{mqtt_topic}</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DeviceComponent;
