'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Shield, User as UserIcon, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false
  });

  const loadUsers = useCallback(async (page = 1, searchFilters?: UserFilters) => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = searchFilters || filters;
      const params = new URLSearchParams();
      
      if (page > 1) params.append('page', page.toString());
      if (currentFilters.role && currentFilters.role !== 'all') params.append('role', currentFilters.role);
      if (currentFilters.isActive !== undefined) params.append('isActive', currentFilters.isActive.toString());
      if (currentFilters.search) params.append('search', currentFilters.search);

      const response = await fetch(`/api/users?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data.data || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 1,
        hasNext: false,
        hasPrev: false
      });
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadUsers(1, filters);
  }, [filters, loadUsers]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const newFilters = { ...filters, search: query };
      setFilters(newFilters);
    } else {
      const newFilters = { ...filters };
      delete newFilters.search;
      setFilters(newFilters);
    }
  }, [filters]);

  const handleFilterChange = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    loadUsers(page, filters);
  }, [loadUsers, filters]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setError(null);
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'moderator':
        return 'Модератор';
      default:
        return 'Пользователь';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-700/50';
      case 'moderator':
        return 'bg-blue-900/20 text-blue-400 border-blue-700/50';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-700/50';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" className="text-accent" />
          <span className="ml-3 text-neutral-400">Загрузка пользователей...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Заголовок страницы */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Управление пользователями</h1>
            <p className="text-gray-400">Создание и редактирование пользователей системы</p>
          </div>
          <Link href="/admin/users/add">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Добавить пользователя
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Фильтры */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск пользователей..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <select
              value={filters.role || 'all'}
              onChange={(e) => handleFilterChange({ role: e.target.value })}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-accent"
            >
              <option value="all">Все роли</option>
              <option value="admin">Администраторы</option>
              <option value="moderator">Модераторы</option>
              <option value="user">Пользователи</option>
            </select>
            
            <select
              value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
              onChange={(e) => handleFilterChange({ isActive: e.target.value === 'all' ? undefined : e.target.value === 'true' })}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-accent"
            >
              <option value="all">Все статусы</option>
              <option value="true">Активные</option>
              <option value="false">Неактивные</option>
            </select>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
            >
              Очистить фильтры
            </button>
          </div>
        </aside>

        {/* Основной контент */}
        <main className="flex-1">
          {/* Статистика */}
          {!searchQuery && (
            <div className="mb-6 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
              <div className="text-sm text-text-secondary">
                <div className="font-medium mb-1">Статистика</div>
                <div>Найдено: {pagination.total}</div>
                {pagination.pages > 1 && <div>Страниц: {pagination.pages}</div>}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center text-red-400 mb-6">
              <h2 className="text-2xl font-bold mb-4">Ошибка загрузки</h2>
              <p>{error}</p>
            </div>
          )}

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {users.map((user) => (
              <div 
                key={user._id} 
                className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 hover:bg-neutral-750 transition-colors"
              >
                {/* Аватар и основная информация */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>

                {/* Роль и статус */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1">{getRoleLabel(user.role)}</span>
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    user.isActive 
                      ? 'bg-green-900/20 text-green-400 border border-green-700/50' 
                      : 'bg-red-900/20 text-red-400 border border-red-700/50'
                  }`}>
                    {user.isActive ? (
                      <>
                        <Eye className="w-3 h-3 inline mr-1" />
                        Активен
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 inline mr-1" />
                        Неактивен
                      </>
                    )}
                  </span>
                </div>

                {/* Дополнительная информация */}
                <div className="text-xs text-gray-500 mb-4">
                  <div>Создан: {new Date(user.createdAt).toLocaleDateString('ru-RU')}</div>
                  {user.lastLogin && (
                    <div>Последний вход: {new Date(user.lastLogin).toLocaleDateString('ru-RU')}</div>
                  )}
                </div>

                {/* Действия */}
                <div className="flex gap-2">
                  <Link href={`/admin/users/${user._id}/edit`}>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Редактировать
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-400 border-red-600 hover:bg-red-600 hover:text-white"
                    onClick={() => {
                      if (confirm(`Удалить пользователя "${user.name}"?`)) {
                        // TODO: Добавить удаление
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {!loading && !error && users.length === 0 && (
            <div className="text-center text-text-secondary">
              <p>Пользователи не найдены</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Назад
              </button>
              <span className="px-4 py-2 text-white">
                {pagination.page} из {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Вперед
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
