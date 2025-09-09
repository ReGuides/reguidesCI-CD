'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Eye, 
  Clock, 
  Globe, 
  Monitor, 
  Smartphone,
  Tablet,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface AnalyticsStats {
  period: string;
  startDate: string;
  total: {
    totalPageViews: number;
    uniqueVisitors: number;
    averageTimeOnPage: number;
    averageLoadTime: number;
    bounceRate: number;
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
  topScreenSizes: Array<{
    screenSize: string;
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

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [selectedPageType, setSelectedPageType] = useState<string>('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period });
      if (selectedPageType) params.append('pageType', selectedPageType);
      
      const response = await fetch(`/api/analytics/stats?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period, selectedPageType]);

  const getDeviceIcon = (deviceCategory: string) => {
    switch (deviceCategory) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getRegionName = (region: string) => {
    const regionNames: Record<string, string> = {
      'europe': 'Европа',
      'asia': 'Азия',
      'americas': 'Америка',
      'africa': 'Африка',
      'oceania': 'Океания',
      'unknown': 'Неизвестно'
    };
    return regionNames[region] || region;
  };

  const getScreenSizeName = (screenSize: string) => {
    const sizeNames: Record<string, string> = {
      'small': 'Маленький',
      'medium': 'Средний',
      'large': 'Большой'
    };
    return sizeNames[screenSize] || screenSize;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Аналитика сайта</h1>
          <p className="text-gray-400">Подробная статистика посещений и поведения пользователей</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={fetchAnalytics}
            variant="outline" 
            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
          <Button 
            onClick={() => window.location.href = '/admin/analytics/improved'}
            variant="outline" 
            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Улучшенная аналитика
          </Button>
          <Button 
            onClick={() => window.location.href = '/admin/analytics/advertising'}
            variant="outline" 
            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Рекламная аналитика
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex gap-4">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-neutral-800 border border-neutral-600 text-white px-3 py-2 rounded-lg"
        >
          <option value="1d">Последние 24 часа</option>
          <option value="7d">Последние 7 дней</option>
          <option value="30d">Последние 30 дней</option>
          <option value="90d">Последние 90 дней</option>
          <option value="all">Все время</option>
        </select>
        
        <select
          value={selectedPageType}
          onChange={(e) => setSelectedPageType(e.target.value)}
          className="bg-neutral-800 border border-neutral-600 text-white px-3 py-2 rounded-lg"
        >
          <option value="">Все типы страниц</option>
          <option value="character">Персонажи</option>
          <option value="weapon">Оружие</option>
          <option value="artifact">Артефакты</option>
          <option value="news">Новости</option>
          <option value="about">О проекте</option>
          <option value="home">Главная</option>
          <option value="search">Поиск</option>
        </select>
      </div>

      {stats && (
        <>
          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-400">Просмотры страниц</CardTitle>
                <Eye className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.total.totalPageViews)}</div>
                <p className="text-xs text-blue-300">Всего просмотров</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-400">Уникальные посетители</CardTitle>
                <Users className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.total.uniqueVisitors)}</div>
                <p className="text-xs text-green-300">Активных пользователей</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-400">Время на странице</CardTitle>
                <Clock className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatTime(stats.total.averageTimeOnPage)}</div>
                <p className="text-xs text-purple-300">Среднее время</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-400">Процент отказов</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total.bounceRate.toFixed(1)}%</div>
                <p className="text-xs text-orange-300">Пользователи ушли быстро</p>
              </CardContent>
            </Card>
          </div>

          {/* Топ страниц */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Топ страниц
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topPages && stats.topPages.slice(0, 10).map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-xs">
                        {page.pageType}
                      </Badge>
                      <span className="text-white font-medium">{page.page}</span>
                      {page.pageId && (
                        <span className="text-gray-400 text-sm">ID: {page.pageId}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400">
                        <Eye className="w-3 h-3 inline mr-1" />
                        {formatNumber(page.views)}
                      </span>
                      <span className="text-gray-400">
                        <Users className="w-3 h-3 inline mr-1" />
                        {formatNumber(page.uniqueVisitors)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* География и устройства */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Топ регионов */}
            <Card className="bg-neutral-800 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Топ регионов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topRegions && stats.topRegions.slice(0, 10).map((region, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white">{getRegionName(region.region)}</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-400">
                          <Eye className="w-3 h-3 inline mr-1" />
                          {formatNumber(region.views)}
                        </span>
                        <span className="text-gray-400">
                          <Users className="w-3 h-3 inline mr-1" />
                          {formatNumber(region.uniqueVisitors)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Топ устройств */}
            <Card className="bg-neutral-800 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-green-400" />
                  Устройства
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topDevices && stats.topDevices.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(device.deviceCategory)}
                        <span className="text-white capitalize">{device.deviceCategory}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-400">
                          <Eye className="w-3 h-3 inline mr-1" />
                          {formatNumber(device.views)}
                        </span>
                        <span className="text-gray-400">
                          <Users className="w-3 h-3 inline mr-1" />
                          {formatNumber(device.uniqueVisitors)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Размеры экранов */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Monitor className="w-5 h-5 text-yellow-400" />
                Размеры экранов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topScreenSizes && stats.topScreenSizes.map((screen, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4" />
                      <span className="text-white">{getScreenSizeName(screen.screenSize)}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400">
                        <Eye className="w-3 h-3 inline mr-1" />
                        {formatNumber(screen.views)}
                      </span>
                      <span className="text-gray-400">
                        <Users className="w-3 h-3 inline mr-1" />
                        {formatNumber(screen.uniqueVisitors)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Временная статистика */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* По часам */}
            <Card className="bg-neutral-800 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Активность по часам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.hourlyStats && stats.hourlyStats.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white text-sm">{hour.hour}:00</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-neutral-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(hour.views / Math.max(...stats.hourlyStats.map(h => h.views))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-400 text-sm w-12 text-right">
                          {formatNumber(hour.views)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* По дням недели */}
            <Card className="bg-neutral-800 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Активность по дням недели
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.weeklyStats && stats.weeklyStats.map((day, index) => {
                    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-white text-sm">{dayNames[day.dayOfWeek - 1]}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-neutral-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(day.views / Math.max(...stats.weeklyStats.map(d => d.views))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-400 text-sm w-12 text-right">
                            {formatNumber(day.views)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
} 