'use client';

import { useState, useEffect } from 'react';

interface SiteSettings {
  _id?: string;
  siteName: string;
  logo?: string;
  favicon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettings = async () => {
    // Предотвращаем повторные запросы
    if (isLoading) {
      console.log('useSiteSettings: Already loading, skipping request');
      return;
    }

    try {
      setIsLoading(true);
      console.log('useSiteSettings: Fetching settings...');
      
      const response = await fetch('/api/settings', {
        // Добавляем кэширование для предотвращения лишних запросов
        cache: 'default',
        // Добавляем заголовки для предотвращения кэширования браузером
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      console.log('useSiteSettings: Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('useSiteSettings: Response result:', result);
        
        if (result.success) {
          console.log('useSiteSettings: Settings loaded:', result.data);
          setSettings(result.data);
        } else {
          console.warn('useSiteSettings: API returned success: false');
        }
      } else {
        console.error('useSiteSettings: Response not ok:', response.status);
      }
    } catch (error) {
      console.error('useSiteSettings: Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSettings = () => {
    fetchSettings();
  };

  useEffect(() => {
    // Загружаем настройки только один раз при монтировании
    fetchSettings();
  }, []); // Пустой массив зависимостей

  return { settings, refreshSettings, isLoading };
};
