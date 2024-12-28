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
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devices`);
                const data = await response.json();
                setDevices(data);
            } catch (error) {
                console.error("Error fetching devices:", error);
            }
        };

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
                setDevices((prevDevices) =>
                    prevDevices.map((device) =>
                        device._id === deviceId ? { ...device, ...updatedDevice } : device
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
    const handleAddDevice = async (newDevice: { name: string; mqtt_topic: string; status: string }) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devices`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newDevice),
            });

            if (response.ok) {
                const addedDevice = await response.json();
                setDevices((prevDevices) => [...prevDevices, addedDevice]);
            } else {
                console.error("Failed to add device");
            }
        } catch (error) {
            console.error("Error adding device:", error);
        }
    };

    return (
        <div>
            {/* Add Device Button */}
            <AddDeviceButton onAddDevice={handleAddDevice} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 mt-4">
                {devices.length === 0 ? (
                    <p>No devices available</p>
                ) : (
                    devices.map((device) => (
                        <DeviceComponent
                            key={device._id}
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
