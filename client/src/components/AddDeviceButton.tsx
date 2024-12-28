import React, { useState } from "react";

const AddDeviceButton = () => {
  const [responseMessage, setResponseMessage] = useState("");

  const handleAddDevice = async () => {
    // Data perangkat yang ingin dikirim
    const deviceData = {
      device_id: "device-001",
      name: "Humidity Sensor",
      status: "active",
      mqtt_topic: "sensor/humidity",
    };

    try {
      // Melakukan POST request ke API
      const response = await fetch("https://server-plant-flow.vercel.app/api/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deviceData),
      });

      const result = await response.json();

      if (response.ok) {
        setResponseMessage(result.message || "Device berhasil ditambahkan!");
      } else {
        setResponseMessage(result.message || "Terjadi kesalahan saat menambahkan perangkat.");
      }
    } catch (error) {
      console.error("Error adding device:", error);
      setResponseMessage("Gagal menghubungi server.");
    }
  };

  return (
    <div>
      <button
        onClick={handleAddDevice}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Device
      </button>
      {responseMessage && <p className="mt-4 text-gray-700">{responseMessage}</p>}
    </div>
  );
};

export default AddDeviceButton;
