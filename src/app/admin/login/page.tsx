'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // Проверяем, не авторизован ли уже пользователь
  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // Пользователь уже авторизован - редирект в админку
        router.push('/admin');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Успешный логин - редирект в админку
        router.push('/admin');
      } else {
        setError(data.error || 'Ошибка входа');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-neutral-900 to-blue-900">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-purple-400 mb-4" />
          <p className="text-gray-300">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-neutral-900 to-blue-900 p-4">
      <div className="w-full max-w-md">
        {/* Логотип и заголовок */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ReGuides Admin</h1>
          <p className="text-gray-400">Войдите в панель администратора</p>
        </div>

        {/* Форма логина */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Поле username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Имя пользователя
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Введите имя пользователя"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Поле password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Введите пароль"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Ошибка */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Кнопка входа */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  Вход...
                </>
              ) : (
                'Войти в админку'
              )}
            </button>
          </form>

        </div>

        {/* Футер */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            © 2024 ReGuides. Все права защищены.
          </p>
        </div>
      </div>
    </div>
  );
}