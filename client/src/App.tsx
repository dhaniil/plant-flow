import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../context/AdminContext';
import ErrorBoundary from './components/ErrorBoundary';
import SensorStats from './components/SensorStats';
import NutrientStats from './components/NutrientStats';
import SensorHistory from './components/SensorHistory';
import { useDataCache } from './hooks/useDataCache';
import { fetchNutrientTopics } from './api/nutrientApi';
import SensorChart from './components/SensorChart';

interface NutrientData {
  id: string;
  name: string;
  value: number | null;
  topic: string;
  color: string;
  unit: string;
}

interface SensorValues {
  temperature: number | null;
  humidity: number | null;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const { isAdmin, logout } = useAdmin();
  const { getFromCache, saveToCache } = useDataCache();
  
  // State untuk sensor
  const [sensorValues, setSensorValues] = useState<SensorValues>({
    temperature: null,
    humidity: null
  });

  const [sensorHistory, setSensorHistory] = useState({
    temperatures: Array(6).fill(null),
    humidities: Array(6).fill(null),
    timestamps: Array(6).fill('')
  });

  // State untuk nutrient
  const [nutrients, setNutrients] = useState<NutrientData[]>([]);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editTopic, setEditTopic] = useState('');
  const [sensorTopic, setSensorTopic] = useState('');
  const [isEditingTopic, setIsEditingTopic] = useState(false);

  // SSE connection
  useEffect(() => {
    const eventSource = new EventSource(`${BACKEND_URL}/api/datasensor/stream`);
    let lastMessageTimestamp = 0; // Untuk tracking pesan terakhir
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const currentTimestamp = Date.now();
        
        // Hanya proses jika pesan baru (interval > 500ms dari pesan sebelumnya)
        if (currentTimestamp - lastMessageTimestamp > 500) {
          // Update untuk sensor suhu/kelembaban
          if (data.hasOwnProperty('temperature') || data.hasOwnProperty('humidity')) {
            setSensorValues(prev => ({
              temperature: data.temperature ?? prev.temperature,
              humidity: data.humidity ?? prev.humidity
            }));

            // Update history hanya untuk data baru
            setSensorHistory(prev => {
              const newTimestamp = new Date().toLocaleTimeString();
              
              // Cek apakah timestamp terakhir berbeda
              if (prev.timestamps[prev.timestamps.length - 1] !== newTimestamp) {
                return {
                  temperatures: [...prev.temperatures.slice(-5), data.temperature],
                  humidities: [...prev.humidities.slice(-5), data.humidity],
                  timestamps: [...prev.timestamps.slice(-5), newTimestamp]
                };
              }
              return prev;
            });
          }

          // Update untuk nutrient values
          if (data.type === 'nutrient') {
            setNutrients(prev => 
              prev.map(nutrient => 
                nutrient.id === data.id 
                  ? { ...nutrient, value: data.value }
                  : nutrient
              )
            );
          }

          lastMessageTimestamp = currentTimestamp;
        }

      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    return () => eventSource.close();
  }, []);

  // Topic management
  const fetchNutrientTopics = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/nutrient/topics`);
      if (!response.ok) {
        throw new Error('Failed to fetch nutrient topics');
      }
      const data = await response.json();
      console.log('Fetched nutrient data:', data); // Debugging
      setNutrients(data.nutrients || []);
    } catch (error) {
      console.error('Error fetching nutrient topics:', error);
      setNutrients([]);
    }
  }, []);

  const handleEdit = (id: string, topic: string) => {
    setEditMode(id);
    setEditTopic(topic);
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/nutrient/topic/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic: editTopic })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update topic');
      }
      
      setEditMode(null);
      fetchNutrientTopics();
    } catch (error) {
      console.error('Error saving nutrient topic:', error);
      alert('Gagal menyimpan perubahan topic');
    }
  };

  useEffect(() => {
    fetchNutrientTopics();
  }, []);

  // Fungsi untuk mengedit topik
  const onEditTopic = async (topic: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/nutrient/topic/${sensorTopic}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to update topic');
      }

      setSensorTopic(topic); // Update state topik
    } catch (error) {
      console.error('Error updating topic:', error);
      alert('Gagal memperbarui topik sensor');
    }
  };

  // Fetch topik sensor saat komponen dimuat


  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <main className="container mx-auto px-4 py-8 space-y-8">
          <SensorStats sensorValues={sensorValues} />
          <SensorChart 
            sensorHistory={sensorHistory} 
            sensorTopic={sensorTopic} 
            onEditTopic={onEditTopic} 
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <NutrientStats 
              nutrients={nutrients}
              editMode={editMode}
              editTopic={editTopic}
              onEdit={handleEdit}
              onSave={handleSave}
              onEditTopicChange={setEditTopic}
              onCancelEdit={() => setEditMode(null)}
            />
            <SensorHistory sensorHistory={sensorHistory} />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(App);

