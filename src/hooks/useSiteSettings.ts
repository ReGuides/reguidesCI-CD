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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSettings(result.data);
        }
      }
    } catch {
      // Тихо игнорируем ошибки, используем fallback значения
      console.warn('Site settings not loaded, using defaults');
    }
  };

  return { settings };
};
