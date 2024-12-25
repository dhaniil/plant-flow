import { useEffect, useState } from "react";
import { connectMqtt } from "../MQTTClient";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { useMqtt } from "../PubSub";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChart {
    title: string;
    topic: string;
    lineColor?: string;
}

const LineChart: React.FC<LineChart> = ({ title, topic, lineColor = "rgba(75, 192, 192, 1" }) => {
    const { message } = useMqtt(topic);
    const [dataPoints, setDataPoints] = useState<number[]>([]);
    const [timeLables, setTimeLables] = useState<string[]>([]);


    useEffect(() => {
        if (message) {
            const waktu_sekarang = new Date().toLocaleTimeString(); //Format jam:menit:detik
            setDataPoints((prev) => [...prev.slice(-20), parseFloat(message)]);
            setTimeLables((prev) => [...prev.slice(-20), waktu_sekarang]);
        }
}, [message]);


const data = {
    labels: timeLables,
    datasets: [
        {
            label: title,
            data: dataPoints,
            fill: false,
            backgroundColor: lineColor.replace("1)", "0.2)"),
            borderColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.4,
        },
    ],
};

const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: title },
    },
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { title: { display: true, text: "Value" } },
    },
  };

  return <Line data={data}/>;
};

export default LineChart;