import React from "react";
import DeviceCard from "../components/Devices";

const Devices: React.FC = () => {
  const publishMessage = (topic: string, message: string) => {
    console.log(`Publishing "${message}" to topic "${topic}"`);
    // Tambahkan implementasi MQTT di sini
  };

  const devices = [
    {
      name: "Pompa Utara",
      deviceId: "esp-001",
      mqttTopic: "hydro/pump/north",
      schedule: ["07:00", "19:00"],
      isOnline: true,
    },
    {
      name: "Lampu Taman",
      deviceId: "esp-002",
      mqttTopic: "garden/lamp",
      schedule: ["18:00", "22:00"],
      isOnline: false,
    },
  ];

  return (
    <div>
      <h2>Devices</h2>
      {devices.map((device) => (
        <DeviceCard
          key={device.deviceId}
          name={device.name}
          deviceId={device.deviceId}
          mqttTopic={device.mqttTopic}
          jadwal={device.schedule}
          status={device.isOnline}
          pesan={publishMessage}
        />
      ))}
    </div>
  );
};

export default Devices;
