'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/lib/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Инициализируем аналитику только на клиенте
    if (typeof window !== 'undefined') {
      initAnalytics();
    }
  }, []);

  return <>{children}</>;
}
