import React, { useState, useEffect, useCallback, useMemo } from "react";
import DeviceComponent from "../components/DeviceComponent";
import AddDeviceButton from "../components/AddDeviceButton";
import { motion } from "framer-motion";
import { useAdmin } from '../../context/AdminContext';
import { useDataCache } from '../hooks/useDataCache';

  

interface Device {
    _id: string;
    device_id: string;
    name: string;
    status: string;
    mqtt_topic: string;
    created_at?: Date;
    updated_at?: Date;
}

const DEVICES_CACHE_KEY = 'hydroponics_devices';

const Device: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const { isAdmin } = useAdmin();
    const { getFromCache, saveToCache } = useDataCache();

    // Memoized fetch function
    const fetchDevices = useCallback(async () => {
        try {
            // Remove cache check temporarily to ensure fresh data
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devices`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setDevices(data);
            // Update cache with fresh data
            saveToCache(DEVICES_CACHE_KEY, data);
        } catch (error) {
            console.error("Gagal mengambil perangkat:", error);
            setDevices([]);
        }
    }, [saveToCache]);

    // Memoized update function
    const handleUpdateDevice = useCallback(async (deviceId: string, updatedData: { device_id: string; name: string; status: string; mqtt_topic: string }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devices/${deviceId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updatedData),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            setDevices(prevDevices => {
                const newDevices = prevDevices.map(device =>
                    device._id === deviceId 
                        ? { 
                            ...device,
                            ...updatedData,
                            device_id: updatedData.device_id || device.device_id // Ensure device_id is preserved
                          } 
                        : device
                );
                saveToCache(DEVICES_CACHE_KEY, newDevices);
                return newDevices;
            });
        } catch (error) {
            console.error("Error mengupdate perangkat:", error);
            throw new Error("Gagal mengupdate perangkat. Silakan coba lagi.");
        }
    }, [saveToCache]);

    // Memoized delete function
    const handleDeleteDevice = useCallback(async (deviceId: string) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devices/${deviceId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setDevices(prevDevices => {
                const newDevices = prevDevices.filter(device => device._id !== deviceId);
                saveToCache(DEVICES_CACHE_KEY, newDevices);
                return newDevices;
            });
        } catch (error) {
            console.error("Error menghapus perangkat:", error);
            throw new Error("Gagal menghapus perangkat. Silakan coba lagi.");
        }
    }, [saveToCache]);

    // Memoized add device function
    const handleAddDevice = useCallback(async (device: { device_id: string; name: string; mqtt_topic: string; status: string }) => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devices`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(device),
            });
        
            console.log("Submitting device:", device);
        
            if (response.status !== 201) {
                const errorData = await response.json();
                console.error("Error response from server:", errorData);
                throw new Error(errorData.message || "Gagal menambahkan perangkat");
            }
        
            // Clear cache and refresh data
            localStorage.removeItem(DEVICES_CACHE_KEY);
            await fetchDevices();
        } catch (error: any) {
            console.error("Error menambahkan perangkat:", error.message);
            throw error;
        }
    }, [fetchDevices]);      
    

    // Memoized sorted devices
    const sortedDevices = useMemo(() => 
        [...devices].sort((a, b) => a.name.localeCompare(b.name)),
        [devices]
    );

    // Polling effect with cleanup
    useEffect(() => {
        fetchDevices();
        const interval = setInterval(fetchDevices, 5000);
        return () => clearInterval(interval);
    }, [fetchDevices]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100/70 py-4 sm:py-8">
            <div className="container mx-auto px-3 sm:px-3">
                {/* Header Section with Stats */}
                <div className="relative overflow-hidden mb-6 sm:mb-8">
                    <div className="relative">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Perangkat</h1>
                                <p className="text-sm sm:text-base text-gray-600">Kelola semua perangkat IoT Anda</p>
                            </div>
                            {/* Stats Card */}
                            <div className="flex gap-4 max-w-24">
                                <div className="bg-white/80 font-poppins rounded-lg p-3 sm:p-4 shadow-sm border border-green-100 w-full sm:w-auto">
                                    <p className="text-xs sm:text-sm text-green-600 mb-1 text-center">Device Active</p>
                                    <p className="text-xl sm:text-2xl font-semibold text-green-800 text-center">{devices.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Button Tambah Perangkat */}
                {isAdmin && (
                    <div className="mb-6 sm:mb-8">
                        <AddDeviceButton 
                            onAddDevice={(device) => handleAddDevice({
                                device_id: device.device_id,
                                name: device.name,
                                mqtt_topic: device.mqtt_topic,
                                status: 'off'  // Set default status
                            })} 
                        />
                    </div>
                )}

                {/* Daftar Perangkat */}
                <motion.div 
                    className="grid grid-cols-3 sm:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {sortedDevices.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center p-6 sm:p-12 bg-white/60 rounded-xl sm:rounded-3xl border border-white/40">
                            <p className="text-sm sm:text-base text-gray-500 text-center">
                                Belum ada perangkat yang ditambahkan.<br/>
                                Klik tombol "Tambah Perangkat" untuk memulai.
                            </p>
                        </div>
                    ) : (
                        sortedDevices.map((device) => (
                            <DeviceComponent
                                key={device._id}
                                _id={device._id}
                                device_id={device.device_id}
                                name={device.name}
                                status={device.status}
                                mqtt_topic={device.mqtt_topic}
                                onUpdate={handleUpdateDevice}
                                onDelete={handleDeleteDevice}
                            />
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default React.memo(Device);
