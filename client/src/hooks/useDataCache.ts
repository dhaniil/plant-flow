import { useState, useCallback } from 'react';

interface CacheData {
  timestamp: number;
  data: any;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

export const useDataCache = () => {
  const getFromCache = useCallback((key: string) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { timestamp, data }: CacheData = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }, []);

  const saveToCache = useCallback((key: string, data: any) => {
    try {
      const cacheData: CacheData = {
        timestamp: Date.now(),
        data
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, []);

  return { getFromCache, saveToCache };
}; 