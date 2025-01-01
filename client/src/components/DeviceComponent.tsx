// src/components/DeviceComponent.tsx
import React, { useState, useEffect, useCallback, memo } from "react";
import { useAdmin } from '../../context/AdminContext';
import mqtt from 'mqtt';
import { Power, Clock, Settings, Activity } from "lucide-react";
import { motion } from "framer-motion";


const MQTT_BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL;

interface DeviceProps {
    deviceId: string;
    device_id: string;
    name: string;
    status: string;
    mqtt_topic: string;
    onUpdate: (id: string, updatedData: { name: string; status: string; mqtt_topic: string }) => void;
    onDelete: (id: string) => void;
}

// Komponen LoadingSpinner
const LoadingSpinner = () => (
    <svg 
        className="animate-spin h-4 w-4 text-gray-500" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
    >
        <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
        />
        <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
    </svg>
);

const DeviceComponent: React.FC<DeviceProps> = memo(({ deviceId, device_id, name, status, mqtt_topic, onUpdate, onDelete }) => {
    const [editing, setEditing] = useState(false);
    const [editedName, setEditedName] = useState(name);
    const [editedStatus, setEditedStatus] = useState(status);
    const [editedMqttTopic, setEditedMqttTopic] = useState(mqtt_topic);
    const [isOnline, setIsOnline] = useState<boolean | null>(() => {
        try {
            return JSON.parse(localStorage.getItem(`device_status_${device_id}`) || 'null');
        } catch {
            return null;
        }
    });
    const [lastMessage, setLastMessage] = useState<string | null>(null);
    const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | null>(null);
    const [isLoading, setIsLoading] = useState<'on' | 'off' | null>(null);
    const { isAdmin } = useAdmin();
    const [activeTab, setActiveTab] = useState("control");

    const updateDeviceStatus = useCallback((status: boolean) => {
        setIsOnline(status);
        try {
            localStorage.setItem(`device_status_${device_id}`, JSON.stringify(status));
        } catch (error) {
            console.error('Storage error:', error);
        }
    }, [device_id]);

    useEffect(() => {
        let client: mqtt.MqttClient | null = null;
        let isComponentMounted = true;

        const initMqtt = async () => {
            try {
                client = mqtt.connect(MQTT_BROKER_URL, {
                    clientId: `plantflow_${device_id}_${Date.now()}`,
                    keepalive: 60,
                    clean: false,
                    reconnectPeriod: 5000,
                    connectTimeout: 30 * 1000,
                });

                client.on('connect', () => {
                    if (isComponentMounted) {
                        setMqttClient(client);
                        client?.subscribe(mqtt_topic, { qos: 1 });
                    }
                });

                client.on('message', (topic, message) => {
                    if (topic === mqtt_topic && isComponentMounted) {
                        const payload = message.toString();
                        const newStatus = payload === '1' || payload.toLowerCase() === 'true';
                        updateDeviceStatus(newStatus);
                        setLastMessage(payload);
                    }
                });
            } catch (error) {
                console.error(`MQTT init error:`, error);
            }
        };

        initMqtt();

        return () => {
            isComponentMounted = false;
            if (client) {
                client.unsubscribe(mqtt_topic, () => {
                    client?.end(true);
                });
            }
        };
    }, [mqtt_topic, device_id, updateDeviceStatus]);

    const publishMessage = useCallback((payload: string) => {
        if (!mqttClient?.connected) return;
        mqttClient.publish(mqtt_topic, payload, { qos: 1, retain: true });
    }, [mqttClient, mqtt_topic]);

    const handleManualControl = async (action: 'on' | 'off') => {
        if (!mqttClient?.connected || isLoading) return;
        
        try {
            setIsLoading(action);
            await new Promise((resolve) => {
                publishMessage(action === 'on' ? '1' : '0');
                setTimeout(resolve, 500);
            });
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="backdrop-blur-xl bg-white/40 p-4 sm:p-6 rounded-2xl shadow-lg overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <h3 className="text-lg sm:text-2xl font-semibold truncate">{name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        {!mqttClient?.connected ? (
                            <div className="flex items-center gap-2">
                                <LoadingSpinner />
                                <span className="text-xs sm:text-sm text-gray-600">
                                    Menghubungkan...
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className={`w-2 h-2 rounded-full ${
                                    isOnline === null ? 'bg-gray-500' :
                                    isOnline ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                                <span className="text-xs sm:text-sm text-gray-600">
                                    {isOnline === null ? 'Menunggu...' : 
                                     isOnline ? 'Online' : 'Offline'}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                {isAdmin && (
                    <div className="flex gap-2">
                        <button onClick={() => setEditing(true)} 
                            className="p-2 hover:bg-gray-100 rounded-full">
                            <Settings size={20} className="text-gray-600" />
                        </button>
                        <button onClick={() => onDelete(deviceId)} 
                            className="p-2 hover:bg-red-50 rounded-full">
                            <i className="ri-delete-bin-line text-xl text-red-500" />
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-4 -mx-4 sm:mx-0">
                <div className="flex border-b overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveTab("control")}
                        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border-b-2 whitespace-nowrap text-sm ${
                            activeTab === "control" 
                                ? "border-green-500 text-green-600" 
                                : "border-transparent text-gray-500"
                        }`}
                    >
                        <Power size={16} />
                        <span>Kontrol</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("schedule")}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 ${
                            activeTab === "schedule" 
                                ? "border-green-500 text-green-600" 
                                : "border-transparent text-gray-500"
                        }`}
                    >
                        <Clock size={16} />
                        <span>Jadwal</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("activity")}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 ${
                            activeTab === "activity" 
                                ? "border-green-500 text-green-600" 
                                : "border-transparent text-gray-500"
                        }`}
                    >
                        <Activity size={16} />
                        <span>Aktivitas</span>
                    </button>
                </div>

                <div className="mt-4 px-4 sm:px-0">
                    {activeTab === "control" && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <motion.button
                                onClick={() => handleManualControl('on')}
                                disabled={!mqttClient?.connected || isLoading !== null}
                                className={`
                                    flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-medium
                                    flex items-center justify-center gap-2
                                    text-sm sm:text-base
                                    transition-all duration-200 
                                    ${isOnline ? 'bg-green-500 text-white' : 'bg-green-500/10 text-green-600'}
                                    ${!mqttClient?.connected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}
                                    ${isLoading === 'on' ? 'animate-pulse' : ''}
                                `}
                                whileTap={{ scale: 0.97 }}
                            >
                                {isLoading === 'on' ? (
                                    <LoadingSpinner />
                                ) : (
                                    <Power size={16} className="sm:size-18" />
                                )}
                                <span>{isLoading === 'on' ? 'Menyalakan...' : 'Nyalakan'}</span>
                            </motion.button>

                            <motion.button
                                onClick={() => handleManualControl('off')}
                                disabled={!mqttClient?.connected || isLoading !== null}
                                className={`
                                    flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-medium
                                    flex items-center justify-center gap-2
                                    text-sm sm:text-base
                                    transition-all duration-200
                                    ${!isOnline ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-600'}
                                    ${!mqttClient?.connected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}
                                    ${isLoading === 'off' ? 'animate-pulse' : ''}
                                `}
                                whileTap={{ scale: 0.97 }}
                            >
                                {isLoading === 'off' ? (
                                    <LoadingSpinner />
                                ) : (
                                    <Power size={16} className="sm:size-18" />
                                )}
                                <span>{isLoading === 'off' ? 'Mematikan...' : 'Matikan'}</span>
                            </motion.button>
                        </div>
                    )}

                    {activeTab === "schedule" && (
                        <div className="space-y-3">
                            <div className="bg-white/50 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-gray-500" />
                                    <span className="text-sm text-gray-700">08:00 - Setiap Hari</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "activity" && (
                        <div className="space-y-2">
                            <div className="bg-white/50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    Aktif terkahir: {lastMessage ? new Date().toLocaleString() : 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Status: {mqttClient?.connected ? 'Terhubung' : 'Terputus'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!mqttClient?.connected && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4 px-4 sm:px-0 py-2 bg-gray-50 rounded-lg">
                    <LoadingSpinner />
                    <span>Menghubungkan ke perangkat...</span>
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gray-900/50 " 
                        onClick={() => setEditing(false)} />
                    <div className="relative z-50 w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl">
                        <div className="space-y-4">
                            <input
                                className="w-full p-2.5 border rounded-lg"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                placeholder="Nama Device"
                            />
                            <input
                                className="w-full p-2.5 border rounded-lg"
                                value={editedStatus}
                                onChange={(e) => setEditedStatus(e.target.value)}
                                placeholder="Status"
                            />
                            <input
                                className="w-full p-2.5 border rounded-lg"
                                value={editedMqttTopic}
                                onChange={(e) => setEditedMqttTopic(e.target.value)}
                                placeholder="MQTT Topic"
                            />
                            <button 
                                onClick={() => {
                                    onUpdate(deviceId, {
                                        name: editedName,
                                        status: editedStatus,
                                        mqtt_topic: editedMqttTopic
                                    });
                                    setEditing(false);
                                }}
                                className="w-full bg-green-500 text-white p-2.5 rounded-lg hover:bg-green-600"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default DeviceComponent;
