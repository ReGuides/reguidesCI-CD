'use client';

import { Suspense } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

function AnalyticsTracker() {
  try {
    useAnalytics();
    return null;
  } catch (error) {
    // Игнорируем ошибки на сервере или при проблемах с хуками
    if (process.env.NODE_ENV === 'development') {
      console.warn('Analytics hook error:', error);
    }
    return null;
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </>
  );
}
