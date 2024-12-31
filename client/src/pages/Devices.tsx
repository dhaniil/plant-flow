// src/components/Device.tsx
import React, { useState, useEffect } from "react";
import DeviceComponent from "../components/DeviceComponent";
import AddDeviceButton from "../components/AddDeviceButton";
import { motion } from "framer-motion";
import { useAdmin } from '../../context/AdminContext';


interface Device {
    _id: string;
    device_id: string;
    name: string;
    status: string;
    mqtt_topic: string;
}

const Device: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const { isAdmin } = useAdmin();
    

    // Fetch devices from the backend API
    const fetchDevices = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devices`);
            const data = await response.json();
            setDevices(data);
        } catch (error) {
            console.error("Error fetching devices:", error);
        }
    };

    // Pindahkan useEffect ke luar
    useEffect(() => {
        fetchDevices();
    }, []);

    // Update device details
    const handleUpdateDevice = async (deviceId: string, updatedData: { name: string; status: string; mqtt_topic: string }) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devices/${deviceId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });
    
            if (response.ok) {
                const updatedDevice = await response.json();
    
                // Perbarui state secara lokal
                setDevices((prevDevices) =>
                    prevDevices.map((device) =>
                        device._id === deviceId ? { ...device, ...updatedData } : device
                    )
                );
            } else {
                console.error("Failed to update device");
            }
        } catch (error) {
            console.error("Error updating device:", error);
        }
    };
    

    // Delete device
    const handleDeleteDevice = async (deviceId: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devices/${deviceId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setDevices((prevDevices) => prevDevices.filter((device) => device._id !== deviceId));
            } else {
                console.error("Failed to delete device");
            }
        } catch (error) {
            console.error("Error deleting device:", error);
        }
    };

    // Add device handler
    const handleAddDevice = async (device: { 
        name: string; 
        topic: string;
        status: boolean
    }) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devices`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    device_id: device.name.toLowerCase().replace(/\s+/g, '-'), // generate device_id
                    name: device.name,
                    mqtt_topic: device.topic,
                    status: String(device.status)
                }),
            });

            if (response.ok) {
                // Setelah berhasil menambah, langsung fetch data terbaru
                await fetchDevices();
            } else {
                console.error("Failed to add device");
            }
        } catch (error) {
            console.error("Error adding device:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100/70 py-4 sm:py-8">
            <div className="container mx-auto px-3 sm:px-4">
                {/* Header Section with Stats */}
                <div className="relative overflow-hidden mb-6 sm:mb-8">
                    <div className="absolute inset-0 bg-[url('/leaf-pattern.png')] opacity-5"></div>
                    <div className="relative">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Perangkat</h1>
                                <p className="text-sm sm:text-base text-gray-600">Kelola semua perangkat IoT Anda</p>
                            </div>
                            {/* Stats Card */}
                            <div className="flex gap-4">
                                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-sm border border-green-100 w-full sm:w-auto">
                                    <p className="text-xs sm:text-sm text-green-600 mb-1">Device Active</p>
                                    <p className="text-xl sm:text-2xl font-semibold text-green-800">{devices.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Device Button - Only show for admin */}
                {isAdmin && (
                    <div className="mb-6 sm:mb-8">
                        <AddDeviceButton onAddDevice={handleAddDevice} />
                    </div>
                )}

                {/* Devices Grid - Modified for better mobile view */}
                <motion.div 
                    className="grid grid-cols-1 gap-4 sm:gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {devices.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center p-6 sm:p-12 bg-white/60 rounded-xl sm:rounded-3xl border border-white/40">
                            <img 
                                src="/empty-devices.svg" 
                                alt="No devices" 
                                className="w-32 h-32 sm:w-48 sm:h-48 mb-4 opacity-50"
                            />
                            <p className="text-sm sm:text-base text-gray-500 text-center">
                                Belum ada perangkat yang ditambahkan.<br/>
                                Klik tombol "Tambah Perangkat" untuk memulai.
                            </p>
                        </div>
                    ) : (
                        devices.map((device, index) => (
                            <DeviceComponent
                                key={device._id || index}
                                deviceId={device._id}
                                device_id={device.device_id}
                                name={device.name}
                                status={device.status}
                                mqtt_topic={device.mqtt_topic}
                                onUpdate={handleUpdateDevice}
                                onDelete={handleDeleteDevice}
                                isAdmin={isAdmin}
                            />
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Device;
function useAuth(): { user: any; } {
    throw new Error("Function not implemented.");
}

