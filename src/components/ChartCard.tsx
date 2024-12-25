import React, { useState } from "react";
import LineChart from "../LineChart";

interface ChartCardProps {
  initialTopic: string;
  initialTitle: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ initialTopic, initialTitle }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [title, setTitle] = useState(initialTitle);
  const [lineColor, setLineColor] = useState("rgba(75, 192, 192, 1)");
  const [showModal, setShowModal] = useState(false);

  // Handle modal submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        marginBottom: "20px",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Edit Button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          border: "none",
          background: "none",
          cursor: "pointer",
        }}
      >
        ✏️
      </button>

      <h3 style={{ marginBottom: "10px" }}>{title}</h3>
      <LineChart title={title} topic={topic} />

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <h3>Edit Chart Settings</h3>
            <form onSubmit={handleSubmit}>
              {/* Input for Title */}
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor="title">Title:</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>

              {/* Input for Topic */}
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor="topic">Topic:</label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>

              {/* Input for Line Color */}
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor="lineColor">Line Color:</label>
                <input
                  id="lineColor"
                  type="color"
                  value={lineColor}
                  onChange={(e) => setLineColor(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    border: "none",
                    cursor: "pointer",
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#ccc",
                    border: "none",
                    padding: "10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#4caf50",
                    color: "white",
                    border: "none",
                    padding: "10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartCard;
