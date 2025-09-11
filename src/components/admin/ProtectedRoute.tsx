'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface User {
  id: string;
  username: string;
  role: string;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthorized(true);
        setUser(data.user);
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
  };

  const tryRefreshToken = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      const response = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // Токен обновлен, проверяем авторизацию снова
        await checkAuth();
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
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsAuthorized(false);
      setUser(null);
      router.push('/admin/login');
    }
  };

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

  // Если авторизован - показываем контент с информацией о пользователе
  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Информация о пользователе в шапке */}
      <div className="bg-neutral-800 border-b border-neutral-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.username}</p>
              <p className="text-gray-400 text-xs">Администратор</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
