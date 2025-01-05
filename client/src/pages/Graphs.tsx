// Graphs.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import LineChart from '../components/LineChart';
import AddChartButton from '../components/AddChartButton';
import { useAdmin } from '../../context/AdminContext';

interface ChartData {
  _id: string;
  name: string;
  topic: string;
}

// Cache key untuk menyimpan data charts
const CHARTS_CACHE_KEY = 'hydroponics_charts';
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit dalam milliseconds

const Graphs: React.FC = () => {
  const { isAdmin } = useAdmin();
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk mengambil data dari cache
  const getFromCache = useCallback(() => {
    const cached = localStorage.getItem(CHARTS_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
    return null;
  }, []);

  // Fungsi untuk menyimpan data ke cache
  const saveToCache = useCallback((data: ChartData[]) => {
    localStorage.setItem(
      CHARTS_CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  }, []);

  // Fungsi untuk mengambil data charts dengan caching
  const fetchCharts = useCallback(async (showError = false) => {
    try {
      // Coba ambil dari cache dulu
      const cachedData = getFromCache();
      if (cachedData) {
        setCharts(cachedData);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chart`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setCharts(response.data);
      saveToCache(response.data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching charts:', error);
      setError('Gagal mengambil data charts');
      if (showError) {
        alert('Gagal mengambil data charts');
      }
      setLoading(false);
    }
  }, [getFromCache, saveToCache]);

  // Memoize charts yang sudah diurutkan
  const sortedCharts = useMemo(() => 
    [...charts].sort((a, b) => a.name.localeCompare(b.name)),
    [charts]
  );

  // Memoize fungsi handleDelete
  const handleDelete = useCallback(async (id: string) => {
    if (!id) {
      console.error('ID tidak valid');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/chart/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setCharts(prevCharts => {
          const newCharts = prevCharts.filter(chart => chart._id !== id);
          saveToCache(newCharts);
          return newCharts;
        });
      } else {
        throw new Error(response.data.message || 'Gagal menghapus chart');
      }
    } catch (error: any) {
      console.error('Error deleting chart:', error.response || error);
      alert('Gagal menghapus chart');
      fetchCharts(true);
    }
  }, [fetchCharts, saveToCache]);

  // Memoize fungsi handleUpdate
  const handleUpdate = useCallback(async (id: string, updatedData: { name: string; topic: string }) => {
    if (!id) {
      console.error('ID tidak valid');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/chart/${id}`,
        updatedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data) {
        setCharts(prevCharts => {
          const newCharts = prevCharts.map(chart =>
            chart._id === id ? { ...chart, ...updatedData } : chart
          );
          saveToCache(newCharts);
          return newCharts;
        });
      }
    } catch (error) {
      console.error('Error updating chart:', error);
      throw error;
    }
  }, [saveToCache]);

  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100/70 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-3">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : (
          <>
            <div className="relative overflow-hidden mb-6 sm:mb-8">
              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Grafik</h1>
                    <p className="text-sm sm:text-base text-gray-600">Monitor data sensor dalam bentuk grafik</p>
                  </div>
                  <div className="flex gap-4 min-w-24">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-sm border border-green-100 w-full sm:w-auto">
                      <p className="text-xs sm:text-sm text-green-600 mb-1 text-center">Grafik Aktif</p>
                      <p className="text-xl sm:text-2xl font-semibold text-green-800 text-center">{charts.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {sortedCharts.map((chart) => (
                <LineChart
                  key={chart._id}
                  id={chart._id}
                  name={chart.name}
                  topic={chart.topic}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {isAdmin && <AddChartButton onAddChart={(newChart) => {
              setCharts(prev => {
                const newCharts = [...prev, newChart];
                saveToCache(newCharts);
                return newCharts;
              });
            }} />}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(Graphs);
