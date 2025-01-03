import React, { useMemo } from 'react';

interface SensorHistoryProps {
  sensorHistory: {
    temperatures: Array<number | null>;
    humidities: Array<number | null>;
    timestamps: string[];
  };
}

const SensorHistory: React.FC<SensorHistoryProps> = ({ sensorHistory }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-green-500/30">
            <th className="py-4 px-6 text-left text-green-700 font-semibold">Waktu</th>
            <th className="py-4 px-6 text-left text-green-700 font-semibold">Suhu</th>
            <th className="py-4 px-6 text-left text-green-700 font-semibold">Kelembaban</th>
          </tr>
        </thead>
        <tbody>
          {sensorHistory.timestamps.map((time, index) => time && (
            <tr key={index} className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors">
              <td className="py-4 px-6 text-green-600 font-medium">{time}</td>
              <td className="py-4 px-6 text-green-600">
                {sensorHistory.temperatures[index] !== null 
                  ? `${sensorHistory.temperatures[index]?.toFixed(1)}°C`
                  : '-'}
              </td>
              <td className="py-4 px-6 text-green-600">
                {sensorHistory.humidities[index] !== null
                  ? `${sensorHistory.humidities[index]?.toFixed(1)}%`
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(SensorHistory); 