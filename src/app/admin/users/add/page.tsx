'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/ui/image-upload';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AddUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    login: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'admin' | 'moderator',
    avatar: '',
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.login || !form.password || !form.role) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    if (form.password.length < 8) {
      alert('Пароль должен содержать минимум 8 символов');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          login: form.login,
          password: form.password,
          role: form.role,
          avatar: form.avatar || undefined,
          isActive: form.isActive
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Пользователь успешно создан!');
          router.push('/admin/users');
        }
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Ошибка при создании пользователя');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-white">Добавить пользователя</h1>
          <p className="text-gray-400">Создание нового пользователя системы</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  Пароль *
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Минимум 8 символов"
                    className="bg-neutral-700 border-neutral-600 text-white pr-10"
                    required
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
                  Подтвердите пароль *
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Повторите пароль"
                  className="bg-neutral-700 border-neutral-600 text-white"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Роль и настройки */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Роль и настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Кнопки действий */}
        <div className="flex justify-end space-x-4">
          <Link href="/admin/users">
            <Button variant="outline" type="button">
              Отмена
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Создаем...' : 'Создать пользователя'}
          </Button>
        </div>
      </form>
    </div>
  );
}
