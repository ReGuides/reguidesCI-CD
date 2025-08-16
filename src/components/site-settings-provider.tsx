'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const SiteSettingsProvider = () => {
  const { settings, loading, error } = useSiteSettings();

  // Debug logging
  console.log('SiteSettingsProvider render:', { settings, loading, error });

  useEffect(() => {
    if (settings) {
      console.log('Applying site settings:', settings);
      
      // Обновляем заголовок страницы
      if (settings.siteName) {
        document.title = settings.siteName;
        console.log('Updated document title to:', settings.siteName);
      }

      // Обновляем favicon
      if (settings.favicon) {
        const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (faviconLink) {
          faviconLink.href = settings.favicon;
          console.log('Updated favicon to:', settings.favicon);
        } else {
          const newFaviconLink = document.createElement('link');
          newFaviconLink.rel = 'icon';
          newFaviconLink.href = settings.favicon;
          document.head.appendChild(newFaviconLink);
          console.log('Created new favicon link:', settings.favicon);
        }
      }
    } else if (error) {
      console.error('SiteSettingsProvider error:', error);
    }
  }, [settings, error]);

  return null; // Этот компонент не рендерит ничего
};
