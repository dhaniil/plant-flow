import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplet } from 'lucide-react';

interface WeatherData {
  t: number;
  hu: number;
  weather_desc: string;
  image: string;
  local_datetime: string;
  tcc: number; // tutupan awan dalam persen
}

interface LocationData {
  provinsi: string;
  kotkab: string;
  kecamatan: string;
  desa: string;
}

const Cuaca: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=34.04.14.2001');
      const data = await response.json();

      // Set lokasi
      setLocation(data.lokasi);

      // Ambil data cuaca dari array pertama
      const allForecasts = data.data[0].cuaca.flat(); // Flatten array 2D menjadi 1D
      const currentTime = new Date();
      
      // Filter dan ambil 5 periode terdekat setelah waktu sekarang
      const nextPeriods = allForecasts
        .filter((period: WeatherData) => new Date(period.local_datetime) > currentTime)
        .slice(0, 5);

      setWeatherData(nextPeriods);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Gagal memuat data cuaca');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header dengan lokasi */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{location?.kecamatan}, {location?.kotkab}</h2>
        <p className="text-gray-500">{location?.provinsi}</p>
      </div>

      {/* Data cuaca 5 periode */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {weatherData.map((period, index) => (
          <div 
            key={index}
            className="bg-gray-50 rounded-lg p-4 flex flex-col items-center"
          >
            {/* Tanggal */}
            <div className="text-sm text-gray-600 mb-1">
              {formatDate(period.local_datetime)}
            </div>
            
            {/* Waktu */}
            <div className="text-sm font-semibold text-green-600 mb-2">
              {formatTime(period.local_datetime)}
            </div>

            {/* SVG Cuaca */}
            <img 
              src={period.image}
              alt={period.weather_desc}
              className="w-16 h-16 mb-2"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://api-apps.bmkg.go.id/storage/icon/cuaca/cerah-am.svg';
              }}
            />

            {/* Suhu */}
            <div className="text-2xl font-bold text-green-600 mb-1">
              {period.t}°C
            </div>

            {/* Kondisi Cuaca */}
            <div className="text-sm text-center text-gray-600 mb-2">
              {period.weather_desc}
            </div>

            {/* Info tambahan */}
            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Kelembaban:</span>
                <span className="font-medium">{period.hu}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Tutupan Awan:</span>
                <span className="font-medium">{period.tcc}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cuaca;
