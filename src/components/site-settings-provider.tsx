'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const SiteSettingsProvider = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings) {
      console.log('SiteSettingsProvider: Settings updated:', settings);
      
      // Обновляем заголовок страницы
      if (settings.siteName) {
        document.title = settings.siteName;
        console.log('SiteSettingsProvider: Title updated to:', settings.siteName);
      }

      // Обновляем favicon
      if (settings.favicon) {
        console.log('SiteSettingsProvider: Updating favicon to:', settings.favicon);
        
        // Удаляем все существующие favicon ссылки
        const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
        console.log('SiteSettingsProvider: Removing existing favicons:', existingFavicons.length);
        existingFavicons.forEach(link => link.remove());

        // Создаем новую ссылку на favicon
        const newFaviconLink = document.createElement('link');
        newFaviconLink.rel = 'icon';
        newFaviconLink.href = `${settings.favicon}?v=${Date.now()}`; // Добавляем timestamp для избежания кэширования
        document.head.appendChild(newFaviconLink);

        // Также добавляем shortcut icon для совместимости
        const shortcutIconLink = document.createElement('link');
        shortcutIconLink.rel = 'shortcut icon';
        shortcutIconLink.href = `${settings.favicon}?v=${Date.now()}`;
        document.head.appendChild(shortcutIconLink);

        console.log('SiteSettingsProvider: Favicon updated successfully to:', settings.favicon);
      }
    }
  }, [settings]);

  return null; // Этот компонент не рендерит ничего
};
