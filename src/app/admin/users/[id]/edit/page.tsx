'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User } from '@/types';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/ui/image-upload';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Link from 'next/link';

interface UserFormData {
  name: string;
  login: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'admin' | 'moderator';
  avatar: string;
  isActive: boolean;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<UserFormData>({
    name: '',
    login: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    avatar: '',
    isActive: true
  });

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${params.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const userData = data.data;
        setUser(userData);
        setForm({
          name: userData.name || '',
          login: userData.login || '',
          password: '',
          confirmPassword: '',
          role: userData.role || 'user',
          avatar: userData.avatar || '',
          isActive: userData.isActive !== undefined ? userData.isActive : true
        });
      } else {
        throw new Error('Пользователь не найден');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchUser();
    }
  }, [params.id, fetchUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.login || !form.role) {
      alert('Заполните обязательные поля');
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    if (form.password && form.password.length < 8) {
      alert('Пароль должен содержать минимум 8 символов');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData: Partial<UserFormData> = {
        name: form.name,
        login: form.login,
        role: form.role,
        avatar: form.avatar || undefined,
        isActive: form.isActive
      };

      // Добавляем пароль только если он был изменен
      if (form.password) {
        updateData.password = form.password;
      }

      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        alert('Пользователь успешно обновлен!');
        router.push('/admin/users');
      } else {
        throw new Error(data.message || 'Ошибка при обновлении');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" className="text-accent" />
          <span className="ml-3 text-neutral-400">Загрузка пользователя...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-red-400">
          <h2 className="text-2xl font-bold mb-4">Ошибка загрузки</h2>
          <p>{error || 'Пользователь не найден'}</p>
          <Button 
            onClick={() => router.push('/admin/users')}
            className="mt-4"
          >
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Редактировать пользователя</h1>
          <p className="text-gray-400">Изменение данных пользователя {user.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Основная информация</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Имя *
              </label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введите имя пользователя"
                className="bg-neutral-700 border-neutral-600 text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="login" className="block text-sm font-medium text-white mb-2">
                Логин *
              </label>
              <Input
                id="login"
                type="text"
                value={form.login}
                onChange={(e) => setForm(prev => ({ ...prev, login: e.target.value }))}
                placeholder="Введите логин пользователя"
                className="bg-neutral-700 border-neutral-600 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Новый пароль (оставьте пустым, если не хотите менять)
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Минимум 8 символов"
                    className="bg-neutral-700 border-neutral-600 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Минимум 8 символов</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                  Подтвердите новый пароль
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Повторите пароль"
                  className="bg-neutral-700 border-neutral-600 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Роль и настройки */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Роль и настройки</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-white mb-2">
                Роль *
              </label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' | 'moderator' }))}
                className="w-full h-10 rounded-md border border-neutral-600 bg-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="user">Пользователь</option>
                <option value="moderator">Модератор</option>
                <option value="admin">Администратор</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Аватар
              </label>
              <ImageUpload
                value={form.avatar}
                onChange={(value) => setForm(prev => ({ ...prev, avatar: value }))}
                placeholder="Загрузить аватар пользователя"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-neutral-600 bg-neutral-700"
              />
              <label htmlFor="isActive" className="text-white">
                Активный пользователь
              </label>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end space-x-4">
          <Link href="/admin/users">
            <Button variant="outline" type="button">
              Отмена
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Сохраняем...' : 'Сохранить изменения'}
          </Button>
        </div>
      </form>
    </div>
  );
}
