import { stat } from "fs";
import React, { useState } from "react";

interface Devices {
    name: string;
    deviceId: string;
    mqttTopic: string;
    jadwal: string[];
    status: boolean;
    pesan: (topic: string, pesan: string) => void
}

const DeviceCard: React.FC<Devices> = ({
    name,
    deviceId,
    mqttTopic,
    jadwal,
    status,
    pesan,
  }) => {
    const [isOn, setIsOn] = useState(false);
    const [showJadwalModal, setShowJadwalModal] = useState(false);
  
    const toggleDevice = () => {
      const newState = !isOn;
      setIsOn(newState);
      pesan(mqttTopic, newState ? "ON" : "OFF");
    };
    return (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            margin: "16px 0",
            background: "#fff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3>{name}</h3>
          <p>
            <strong>Device ID:</strong> {deviceId}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color: status ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {status ? "Online" : "Offline"}
            </span>
          </p>
          <button
            onClick={toggleDevice}
            style={{
              padding: "10px",
              border: "none",
              borderRadius: "4px",
              background: isOn ? "#4caf50" : "#f44336",
              color: "#fff",
              cursor: "pointer",
              marginRight: "8px",
            }}
          >
            {isOn ? "Turn Off" : "Turn On"}
          </button>
          <button
            onClick={() => setShowJadwalModal(true)}
            style={{
              padding: "10px",
              border: "none",
              borderRadius: "4px",
              background: "#2196f3",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Set Schedule
          </button>
    
          {/* Modal untuk pengaturan jadwal */}
          {showJadwalModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  padding: "20px",
                  borderRadius: "8px",
                  width: "90%",
                  maxWidth: "400px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h3>Edit Schedule</h3>
                <ul>
                  {jadwal.map((time, index) => (
                    <li key={index}>
                      {time}
                      <button
                        style={{
                          marginLeft: "8px",
                          background: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          const updatedSchedule = jadwal.filter(
                            (_, i) => i !== index
                          );
                          console.log("Updated schedule:", updatedSchedule);
                        }}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowJadwalModal(false)}
                  style={{
                    background: "#ccc",
                    border: "none",
                    padding: "10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      );
    };
    
    export default DeviceCard;
    
