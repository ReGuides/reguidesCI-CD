'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const SiteSettingsProvider = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings) {
      // Обновляем заголовок страницы
      if (settings.siteName) {
        document.title = settings.siteName;
      }

      // Обновляем favicon
      if (settings.favicon) {
        const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (faviconLink) {
          faviconLink.href = settings.favicon;
        } else {
          const newFaviconLink = document.createElement('link');
          newFaviconLink.rel = 'icon';
          newFaviconLink.href = settings.favicon;
          document.head.appendChild(newFaviconLink);
        }
      }
    }
  }, [settings]);

  return null; // Этот компонент не рендерит ничего
};
