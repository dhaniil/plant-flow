// src/components/Device.tsx
import React, { useState, useEffect } from "react";
import DeviceComponent from "../components/DeviceComponent";
import AddDeviceButton from "../components/AddDeviceButton";


interface Device {
    _id: string;
    device_id: string;
    name: string;
    status: string;
    mqtt_topic: string;
}

const Device: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);

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
        <div className="bg-green-100 py-5 min-h-screen h-auto">
            {/* Add Device Button */}
            <AddDeviceButton onAddDevice={handleAddDevice} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 mt-4">
                {devices.length === 0 ? (
                    <p>No devices available</p>
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
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Device;
