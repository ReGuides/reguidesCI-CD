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

      // Обновляем favicon только если он действительно изменился
      if (settings.favicon) {
        const currentFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        const currentHref = currentFavicon?.href;
        
        // Проверяем, действительно ли favicon изменился
        if (!currentHref || !currentHref.includes(settings.favicon)) {
          console.log('SiteSettingsProvider: Updating favicon to:', settings.favicon);
          
          // Удаляем все существующие favicon ссылки
          const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
          existingFavicons.forEach(link => link.remove());

          // Создаем новую ссылку на favicon
          const newFaviconLink = document.createElement('link');
          newFaviconLink.rel = 'icon';
          newFaviconLink.href = `${settings.favicon}?v=${Date.now()}`;
          document.head.appendChild(newFaviconLink);

          // Также добавляем shortcut icon для совместимости
          const shortcutIconLink = document.createElement('link');
          shortcutIconLink.rel = 'shortcut icon';
          shortcutIconLink.href = `${settings.favicon}?v=${Date.now()}`;
          document.head.appendChild(shortcutIconLink);

          console.log('SiteSettingsProvider: Favicon updated successfully to:', settings.favicon);
        } else {
          console.log('SiteSettingsProvider: Favicon unchanged, skipping update');
        }
      }
    }
  }, [settings]);

  return null; // Этот компонент не рендерит ничего
};
