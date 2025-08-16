'use client';

import { useAnalytics } from '@/hooks/useAnalytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Автоматически отслеживаем аналитику на всех страницах
  useAnalytics();
  
  return <>{children}</>;
}
