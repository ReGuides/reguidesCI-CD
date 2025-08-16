'use client';
import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Генерируем уникальный session ID
const generateSessionId = (): string => {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
  return 'unknown';
};

// Генерируем уникальный visitor ID
const generateVisitorId = (): string => {
  if (typeof window !== 'undefined') {
    let visitorId = localStorage.getItem('analytics_visitor_id');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_visitor_id', visitorId);
    }
    return visitorId;
  }
  return 'unknown';
};

// Отслеживание просмотра страницы
const trackPageView = async (url: string, title: string) => {
  try {
    const sessionId = generateSessionId();
    const visitorId = generateVisitorId();
    
    await fetch('/api/analytics/page-views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        title,
        sessionId,
        userId: visitorId,
        userAgent: navigator.userAgent,
        referrer: document.referrer
      }),
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

// Отслеживание события
export const trackEvent = async (
  eventType: string,
  eventName: string,
  metadata?: Record<string, string | number | boolean>
) => {
  try {
    const sessionId = generateSessionId();
    const visitorId = generateVisitorId();
    
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        eventName,
        sessionId,
        userId: visitorId,
        url: window.location.href,
        metadata
      }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Отслеживание поиска
export const trackSearch = async (query: string, resultsCount: number) => {
  try {
    const sessionId = generateSessionId();
    const visitorId = generateVisitorId();
    
    await fetch('/api/analytics/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        sessionId,
        userId: visitorId,
        ip: 'client', // Будет заменено на сервере
        resultsCount
      }),
    });
  } catch (error) {
    console.error('Failed to track search:', error);
  }
};

// Хук для автоматического отслеживания страниц
export const useAnalytics = () => {
  const pathname = usePathname();
  
  // Безопасно используем useSearchParams только на клиенте
  let searchParams: URLSearchParams | null = null;
  try {
    if (typeof window !== 'undefined') {
      searchParams = useSearchParams();
    }
  } catch (error) {
    // Игнорируем ошибки на сервере
    console.warn('useSearchParams not available on server');
  }
  
  const trackCurrentPage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      const title = document.title || 'Unknown Page';
      trackPageView(url, title);
    }
  }, []);

  useEffect(() => {
    // Отслеживаем при изменении страницы только на клиенте
    if (typeof window !== 'undefined') {
      trackCurrentPage();
    }
  }, [pathname, trackCurrentPage]);

  // Отслеживаем время на странице
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let startTime = Date.now();
    let isActive = true;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActive = false;
      } else {
        isActive = true;
        startTime = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      if (isActive) {
        const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
        // Отправляем время на странице при уходе
        navigator.sendBeacon('/api/analytics/page-views', JSON.stringify({
          url: window.location.href,
          title: document.title,
          sessionId: generateSessionId(),
          timeOnPage,
          isBounce: false
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  return {
    trackEvent,
    trackSearch,
    trackPageView: trackCurrentPage
  };
};
