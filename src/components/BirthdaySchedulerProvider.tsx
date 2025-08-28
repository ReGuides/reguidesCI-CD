'use client';

import { useEffect } from 'react';
import { startBirthdayScheduler } from '@/lib/scheduler/birthdayScheduler';

interface BirthdaySchedulerProviderProps {
  children: React.ReactNode;
}

export default function BirthdaySchedulerProvider({ children }: BirthdaySchedulerProviderProps) {
  useEffect(() => {
    // Запускаем планировщик только в админке
    if (window.location.pathname.startsWith('/admin')) {
      console.log('🎂 Birthday Scheduler: Initializing in admin panel...');
      startBirthdayScheduler();
    }
  }, []);

  return <>{children}</>;
}
