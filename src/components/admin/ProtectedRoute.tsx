'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const tryRefreshToken = useCallback(async (): Promise<void> => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      const response = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // Токен обновлен, проверяем авторизацию снова
        const verifyResponse = await fetch('/api/admin/auth/verify', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (verifyResponse.ok) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.push('/admin/login');
        }
      } else {
        // Не удалось обновить токен - редирект на логин
        setIsAuthorized(false);
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setIsAuthorized(false);
      router.push('/admin/login');
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, router]);

  const checkAuth = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setIsAuthorized(true);
      } else if (response.status === 401) {
        // Попробуем обновить токен
        await tryRefreshToken();
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthorized(false);
    }
  }, [tryRefreshToken]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Показываем загрузку пока проверяем авторизацию
  if (isAuthorized === null || isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-purple-500 mb-4" />
          <p className="text-gray-400">
            {isRefreshing ? 'Обновление сессии...' : 'Проверка авторизации...'}
          </p>
        </div>
      </div>
    );
  }

  // Если не авторизован - показываем загрузку (редирект произойдет автоматически)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-red-500 mb-4" />
          <p className="text-gray-400">Перенаправление на страницу входа...</p>
        </div>
      </div>
    );
  }

  // Если авторизован - показываем контент
  return <>{children}</>;
}
