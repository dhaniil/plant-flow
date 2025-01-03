// src/components/DeviceComponent.tsx
import React, { useState, useEffect, useCallback, memo } from "react";
import { useAdmin } from '../../context/AdminContext';
import mqtt from 'mqtt';
import { Power, Clock, Settings, Activity } from "lucide-react";
import { motion } from "framer-motion";



interface DeviceProps {
    deviceId: string;
    device_id: string;
    name: string;
    status: string;
    mqtt_topic: string;
    onUpdate: (id: string, updatedData: { name: string; status: string; mqtt_topic: string }) => void;
    onDelete: (id: string) => void;
}

type TabType = 'control' | 'schedule' | 'activity';

interface Schedule {
    _id: string;
    name: string;
    waktu: string;
    hari: string[];
    action: 'on' | 'off';
    status: 'active' | 'inactive';
    payload?: string;
    devices: string[];
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
    const [isOnline, setIsOnline] = useState<boolean | null>(null);
    const [lastMessage, setLastMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<'on' | 'off' | null>(null);
    const { isAdmin } = useAdmin();
    const [activeTab, setActiveTab] = useState<TabType>('control');
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    const publishMessage = useCallback(async (payload: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/mqtt/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: mqtt_topic,
                    message: payload,
                    options: { qos: 1, retain: true }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to publish message');
            }
        } catch (error) {
            console.error('Error publishing message:', error);
        }
    }, [mqtt_topic]);

    const handleManualControl = async (action: 'on' | 'off') => {
        if (isLoading) return;
        
        try {
            setIsLoading(action);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/mqtt/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: mqtt_topic,
                    message: action === 'on' ? '1' : '0'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to publish message');
            }

            // Tunggu sebentar untuk animasi
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Error controlling device:', error);
            alert('Gagal mengontrol perangkat. Silakan coba lagi.');
        } finally {
            setIsLoading(null);
        }
    };

    useEffect(() => {
        const fetchSchedules = async () => {
            if (activeTab === "schedule") {
                setIsLoadingSchedules(true);
                try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/jadwal/device/${device_id}`);
                    if (!response.ok) throw new Error('Failed to fetch schedules');
                    const data = await response.json();
                    setSchedules(data);
                } catch (error) {
                    console.error('Error fetching schedules:', error);
                    setSchedules([]);
                } finally {
                    setIsLoadingSchedules(false);
                }
            }
        };

        fetchSchedules();
    }, [device_id, activeTab]);

    const fetchActivityLogs = useCallback(async () => {
        if (activeTab !== 'activity') return;
        
        setIsLoadingLogs(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/logs/device/${device_id}`
            );
            if (!response.ok) throw new Error('Failed to fetch logs');
            const data = await response.json();
            setActivityLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
            setActivityLogs([]);
        } finally {
            setIsLoadingLogs(false);
        }
    }, [device_id, activeTab]);

    useEffect(() => {
        fetchActivityLogs();
    }, [fetchActivityLogs]);

    const renderSchedules = () => (
        <div className="space-y-3">
            {isLoadingSchedules ? (
                <div className="flex justify-center py-4">
                    <LoadingSpinner />
                </div>
            ) : schedules.length > 0 ? (
                schedules.map((schedule) => (
                    <div key={schedule._id} 
                        className={`bg-white/50 p-4 rounded-lg border-l-4 ${
                            schedule.status === 'active' 
                                ? 'border-l-green-500' 
                                : 'border-l-gray-300'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-medium text-gray-900">{schedule.name}</h4>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                    <Clock size={14} />
                                    <span>{schedule.waktu}</span>
                                    <span className="text-gray-400">•</span>
                                    <span>{schedule.hari.join(", ")}</span>
                                </div>
                                <div className="mt-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        schedule.action === 'on' 
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {schedule.action === 'on' ? 'Nyalakan' : 'Matikan'}
                                    </span>
                                    {schedule.status === 'inactive' && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Nonaktif
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-4">
                    <p className="text-gray-500">Belum ada jadwal yang ditambahkan</p>
                </div>
            )}
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'control':
                return (
                    <div className="p-4">
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => handleManualControl('on')}
                                disabled={isLoading === 'on'}
                                className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
                            >
                                {isLoading === 'on' ? <LoadingSpinner /> : 'Nyalakan'}
                            </button>
                            <button
                                onClick={() => handleManualControl('off')}
                                disabled={isLoading === 'off'}
                                className="flex-1 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                                {isLoading === 'off' ? <LoadingSpinner /> : 'Matikan'}
                            </button>
                        </div>
                    </div>
                );
            case 'schedule':
                return renderSchedules();
            case 'activity':
                return (
                    <div className="space-y-3">
                        {isLoadingLogs ? (
                            <div className="flex justify-center py-4">
                                <LoadingSpinner />
                            </div>
                        ) : activityLogs.length > 0 ? (
                            activityLogs.map((log) => (
                                <div key={log._id} className="bg-white/50 p-4 rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                log.action === 'on' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {log.action === 'on' ? 'Dinyalakan' : 'Dimatikan'}
                                            </span>
                                            <div className="mt-1 text-sm text-gray-600">
                                                <p>{new Date(log.executed_at).toLocaleString('id-ID')}</p>
                                                <p className="text-gray-500">{log.trigger_type}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-500">Belum ada aktivitas</p>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    // Render status indicator
    const renderStatus = () => (
        <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${
                status === 'on' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-xs sm:text-sm text-gray-600">
                {status === 'on' ? 'Menyala' : 'Mati'}
            </span>
        </div>
    );

    return (
        <div className="backdrop-blur-xl bg-white/40 p-4 sm:p-6 rounded-2xl shadow-lg overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <h3 className="text-lg sm:text-2xl font-semibold truncate">{name}</h3>
                    {renderStatus()}
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
                <div className="flex border-b overflow-x-auto scrollbar-hide sm:overflow-x-visible">
                    {[
                        { id: 'control', icon: Power, label: 'Kontrol' },
                        { id: 'schedule', icon: Clock, label: 'Jadwal' },
                        { id: 'activity', icon: Activity, label: 'Aktivitas' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`flex-none sm:flex-1 flex items-center gap-2 px-4 py-2 border-b-2 ${
                                activeTab === tab.id 
                                    ? 'border-green-500 text-green-600' 
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-4 px-4 sm:px-0">
                    {renderContent()}
                </div>
            </div>

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
