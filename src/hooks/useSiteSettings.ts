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

  const fetchSettings = async () => {
    try {
      console.log('useSiteSettings: Fetching settings...');
      const response = await fetch('/api/settings');
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
    } catch {
      // Тихо игнорируем ошибки, используем fallback значения
      console.warn('Site settings not loaded, using defaults');
    }
  };

  const refreshSettings = () => {
    fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, refreshSettings };
};
