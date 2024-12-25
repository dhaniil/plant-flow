import React, { useState } from "react";
import ChartCard from "../components/ChartCard";

const Ghraps: React.FC = () => {
  const [charts, setCharts] = useState([
    { topic: "sensor/temperature", title: "Temperature Sensor" },
    { topic: "sensor/humidity", title: "Humidity Sensor" },
  ]);

  const addChart = () => {
    setCharts([...charts, { topic: "sensor/new", title: "New Sensor" }]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Real-Time MQTT Monitoring</h1>
        <button onClick={addChart}>Add Chart</button>
      </div>
      {charts.map((chart, index) => (
        <ChartCard key={index} initialTopic={chart.topic} initialTitle={chart.title} />
      ))}
    </div>
  );
};

export default Ghraps;
