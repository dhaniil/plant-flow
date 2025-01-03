import { Thermometer, Droplet } from 'lucide-react';
import React, { useMemo } from 'react';

interface SensorStatsProps {
  sensorValues: {
    temperature: number | null;
    humidity: number | null;
  };
}


const SensorStats: React.FC<SensorStatsProps> = ({ sensorValues }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { 
          icon: Thermometer, 
          title: "Suhu", 
          value: sensorValues?.temperature != null 
            ? `${sensorValues.temperature.toFixed(1)}°C`
            : "-", 
          color: "white" 
        },
        { 
          icon: Droplet,  
          title: "Kelembaban", 
          value: sensorValues?.humidity != null 
            ? `${sensorValues.humidity.toFixed(1)}%`
            : "-", 
          color: "white" 
        },
      ].map((stat, idx) => (
        <div key={idx} 
             className="bg-green-500 rounded-2xl p-6
                      border border-white/30 shadow-md
                      hover: transition-all duration-300
                      group">
          <div className="flex items-center">
            <div className={`p-4 rounded-xl bg-green-200/40 mr-4
                           group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon size={32} className={`text-${stat.color}`} />
            </div>
            <div>
              <h2 className="text-white font-medium">{stat.title}</h2>
              <p className={`text-3xl font-bold text-${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(SensorStats); 