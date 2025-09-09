'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, Eye, Clock, MousePointer, Globe, Smartphone, Monitor } from 'lucide-react';

interface AnalyticsData {
  period: string;
  startDate: string;
  total: {
    totalPageViews: number;
    uniqueVisitors: number;
    averageTimeOnPage: number;
    averageLoadTime: number;
    bounceRate: number;
  };
  sessions: {
    totalSessions: number;
    newSessions: number;
    returningSessions: number;
    engagedSessions: number;
    averageSessionDuration: number;
    averagePageViewsPerSession: number;
  };
  topPages: Array<{
    page: string;
    pageType: string;
    pageId?: string;
    views: number;
    uniqueVisitors: number;
  }>;
  topRegions: Array<{
    region: string;
    views: number;
    uniqueVisitors: number;
  }>;
  topDevices: Array<{
    deviceCategory: string;
    views: number;
    uniqueVisitors: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    views: number;
  }>;
  weeklyStats: Array<{
    dayOfWeek: number;
    views: number;
  }>;
}

export default function AnalyticsStatsImproved() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/stats-improved?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Ошибка загрузки статистики');
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [period]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}с`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}м ${remainingSeconds}с`;
  };

  const getRegionName = (region: string) => {
    const regions: Record<string, string> = {
      europe: 'Европа',
      asia: 'Азия',
      americas: 'Америка',
      africa: 'Африка',
      oceania: 'Океания',
      unknown: 'Неизвестно'
    };
    return regions[region] || region;
  };

  const getDeviceName = (device: string) => {
    const devices: Record<string, string> = {
      desktop: 'Десктоп',
      mobile: 'Мобильный',
      tablet: 'Планшет'
    };
    return devices[device] || device;
  };

  const getPageTypeName = (pageType: string) => {
    const types: Record<string, string> = {
      character: 'Персонаж',
      weapon: 'Оружие',
      artifact: 'Артефакт',
      news: 'Новости',
      about: 'О сайте',
      home: 'Главная',
      search: 'Поиск',
      other: 'Другое'
    };
    return types[pageType] || pageType;
  };

  if (loading) {
    return (
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
        <div className="text-center text-red-400">
          <p>{error}</p>
          <button
            onClick={loadStats}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтр */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Улучшенная аналитика</h3>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="1d">За день</option>
            <option value="7d">За неделю</option>
            <option value="30d">За месяц</option>
            <option value="90d">За 3 месяца</option>
            <option value="all">За все время</option>
          </select>
        </div>

        {/* Основные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-neutral-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-neutral-400">Просмотры</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(data.total.totalPageViews)}</div>
          </div>

          <div className="bg-neutral-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-sm text-neutral-400">Уникальные посетители</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(data.sessions.totalSessions)}</div>
            <div className="text-xs text-neutral-500 mt-1">По сессиям</div>
          </div>

          <div className="bg-neutral-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-neutral-400">Время на странице</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatTime(data.total.averageTimeOnPage)}</div>
          </div>

          <div className="bg-neutral-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-neutral-400">Отказы</span>
            </div>
            <div className="text-2xl font-bold text-white">{data.total.bounceRate.toFixed(1)}%</div>
          </div>
        </div>

        {/* Статистика сессий */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-neutral-700 rounded-lg p-4">
            <div className="text-sm text-neutral-400 mb-2">Всего сессий</div>
            <div className="text-xl font-bold text-white">{formatNumber(data.sessions.totalSessions)}</div>
          </div>

          <div className="bg-neutral-700 rounded-lg p-4">
            <div className="text-sm text-neutral-400 mb-2">Новые сессии</div>
            <div className="text-xl font-bold text-green-400">{formatNumber(data.sessions.newSessions)}</div>
          </div>

          <div className="bg-neutral-700 rounded-lg p-4">
            <div className="text-sm text-neutral-400 mb-2">Возвращающиеся</div>
            <div className="text-xl font-bold text-blue-400">{formatNumber(data.sessions.returningSessions)}</div>
          </div>

          <div className="bg-neutral-700 rounded-lg p-4">
            <div className="text-sm text-neutral-400 mb-2">Вовлеченные</div>
            <div className="text-xl font-bold text-purple-400">{formatNumber(data.sessions.engagedSessions)}</div>
          </div>

          <div className="bg-neutral-700 rounded-lg p-4">
            <div className="text-sm text-neutral-400 mb-2">Средняя длительность</div>
            <div className="text-xl font-bold text-white">{formatTime(data.sessions.averageSessionDuration)}</div>
          </div>

          <div className="bg-neutral-700 rounded-lg p-4">
            <div className="text-sm text-neutral-400 mb-2">Страниц за сессию</div>
            <div className="text-xl font-bold text-white">{data.sessions.averagePageViewsPerSession.toFixed(1)}</div>
          </div>

          <div className="bg-neutral-700 rounded-lg p-4">
            <div className="text-sm text-neutral-400 mb-2">Вовлеченность</div>
            <div className="text-xl font-bold text-orange-400">{data.sessions.averageEngagementScore?.toFixed(1) || '0.0'}/100</div>
          </div>
        </div>
      </div>

      {/* Топ страниц */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Топ страниц</h4>
        <div className="space-y-3">
          {data.topPages.slice(0, 10).map((page, index) => (
            <div key={index} className="flex items-center justify-between bg-neutral-700 rounded-lg p-3">
              <div className="flex-1">
                <div className="text-white font-medium">{page.page}</div>
                <div className="text-sm text-neutral-400">{getPageTypeName(page.pageType)}</div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{formatNumber(page.views)}</div>
                <div className="text-sm text-neutral-400">{formatNumber(page.uniqueVisitors)} сессий</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Топ регионов */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Топ регионов</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.topRegions.map((region, index) => (
            <div key={index} className="flex items-center justify-between bg-neutral-700 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-white">{getRegionName(region.region)}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{formatNumber(region.views)}</div>
                <div className="text-sm text-neutral-400">{formatNumber(region.uniqueVisitors)} сессий</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Топ устройств */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Топ устройств</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.topDevices.map((device, index) => (
            <div key={index} className="flex items-center justify-between bg-neutral-700 rounded-lg p-3">
              <div className="flex items-center gap-3">
                {device.deviceCategory === 'desktop' && <Monitor className="w-4 h-4 text-blue-400" />}
                {device.deviceCategory === 'mobile' && <Smartphone className="w-4 h-4 text-green-400" />}
                {device.deviceCategory === 'tablet' && <Smartphone className="w-4 h-4 text-purple-400" />}
                <span className="text-white">{getDeviceName(device.deviceCategory)}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{formatNumber(device.views)}</div>
                <div className="text-sm text-neutral-400">{formatNumber(device.uniqueVisitors)} сессий</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
