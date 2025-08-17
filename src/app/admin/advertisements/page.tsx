'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { 
  Plus, 
  Filter,
  Edit,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  cta: string;
  url: string;
  type: string;
  isActive: boolean;
  order: number;
  backgroundImage?: string;
  erid?: string;
  deviceTargeting: string;
  createdAt: string;
  updatedAt: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  lastShown?: string;
}

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/advertisements');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAdvertisements(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту рекламу?')) return;

    try {
      const response = await fetch(`/api/advertisements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAdvertisements(prev => prev.filter(ad => ad._id !== id));
      }
    } catch (error) {
      console.error('Error deleting advertisement:', error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const ad = advertisements.find(a => a._id === id);
      if (!ad) return;

      const response = await fetch(`/api/advertisements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...ad,
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        setAdvertisements(prev => 
          prev.map(ad => 
            ad._id === id ? { ...ad, isActive: !currentStatus } : ad
          )
        );
      }
    } catch (error) {
      console.error('Error toggling advertisement status:', error);
    }
  };

  // Функция для отображения типа рекламы
  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'sidebar':
        return 'Сайдбар';
      case 'banner':
        return 'Баннер';
      case 'popup':
        return 'Всплывающее окно';
      default:
        return type; // Для старых записей
    }
  };

  // Функция для получения цвета типа
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sidebar':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'banner':
        return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'popup':
        return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-neutral-600/20 text-neutral-400 border-neutral-500/30';
    }
  };

  // Функция для отображения целевой аудитории
  const getDeviceDisplay = (device: string) => {
    switch (device) {
      case 'desktop':
        return 'ПК';
      case 'mobile':
        return 'Мобильный';
      case 'all':
        return 'Все';
      default:
        return device; // Для старых записей
    }
  };

  // Функция для получения цвета целевой аудитории
  const getDeviceColor = (device: string) => {
    switch (device) {
      case 'desktop':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'mobile':
        return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'all':
        return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-neutral-600/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const filteredAdvertisements = advertisements.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || ad.type === typeFilter;
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && ad.isActive) ||
                         (statusFilter === 'inactive' && !ad.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Управление рекламой</h1>
          <p className="text-gray-400">Создание и управление рекламными блоками</p>
        </div>
        <Link href="/admin/advertisements/add">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Добавить рекламу
          </Button>
        </Link>
      </div>

      {/* Фильтры */}
      <Card className="bg-neutral-800 border-neutral-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Поиск</label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по названию или описанию..."
                className="bg-neutral-700 border-neutral-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Тип</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-md px-3 py-2"
              >
                <option value="">Все типы</option>
                <option value="sidebar-top">Сайдбар (верх)</option>
                <option value="sidebar-middle">Сайдбар (середина)</option>
                <option value="sidebar-bottom">Сайдбар (низ)</option>
                <option value="banner-top">Баннер (верх страницы)</option>
                <option value="banner-bottom">Баннер (низ страницы)</option>
                <option value="popup">Всплывающее окно</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Статус</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-md px-3 py-2"
              >
                <option value="">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список рекламы */}
      <div className="grid gap-4">
        {filteredAdvertisements.map((ad) => (
          <Card key={ad._id} className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Изображение */}
                <div className="flex-shrink-0">
                  {ad.backgroundImage ? (
                    <Image
                      src={ad.backgroundImage}
                      alt={ad.title}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-neutral-700 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}
                </div>

                {/* Информация */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-2">{ad.title}</h3>
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">{ad.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className={`px-2 py-1 rounded text-xs border ${getTypeColor(ad.type)}`}>
                          {getTypeDisplay(ad.type)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs border ${getDeviceColor(ad.deviceTargeting)}`}>
                          {getDeviceDisplay(ad.deviceTargeting)}
                        </span>
                        <span>Порядок: {ad.order}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          ad.isActive 
                            ? 'bg-green-900/20 text-green-400' 
                            : 'bg-red-900/20 text-red-400'
                        }`}>
                          {ad.isActive ? 'Активна' : 'Неактивна'}
                        </span>
                      </div>
                      
                      {/* Статистика */}
                      <div className="mt-3 grid grid-cols-4 gap-4 text-xs">
                        <div className="bg-neutral-700/50 rounded p-2">
                          <div className="text-gray-400">Показы</div>
                          <div className="text-white font-semibold">{ad.impressions || 0}</div>
                        </div>
                        <div className="bg-neutral-700/50 rounded p-2">
                          <div className="text-gray-400">Клики</div>
                          <div className="text-white font-semibold">{ad.clicks || 0}</div>
                        </div>
                        <div className="bg-neutral-700/50 rounded p-2">
                          <div className="text-gray-400">CTR</div>
                          <div className="text-white font-semibold">
                            {ad.ctr ? `${ad.ctr.toFixed(2)}%` : '0%'}
                          </div>
                        </div>
                        <div className="bg-neutral-700/50 rounded p-2">
                          <div className="text-gray-400">Последний показ</div>
                          <div className="text-white font-semibold">
                            {ad.lastShown ? new Date(ad.lastShown).toLocaleDateString('ru-RU') : 'Нет'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Действия */}
                <div className="flex-shrink-0 flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => toggleStatus(ad._id, ad.isActive)}
                    className={ad.isActive 
                      ? '!bg-red-600 !hover:bg-red-700 !text-white border-0' 
                      : '!bg-green-600 !hover:bg-green-700 !text-white border-0'
                    }
                  >
                    {ad.isActive ? 'Деактивировать' : 'Активировать'}
                  </Button>
                  <div className="flex gap-2">
                    <Link href={`/admin/advertisements/${ad._id}/edit`}>
                      <Button 
                        size="sm" 
                        className="!bg-purple-600 !hover:bg-purple-700 !text-white border-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(ad._id)}
                      className="!bg-red-600 !hover:bg-red-700 !text-white border-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAdvertisements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Реклама не найдена</p>
        </div>
      )}
    </div>
  );
}
