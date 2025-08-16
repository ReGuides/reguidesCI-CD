'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { 
  Users, 
  Eye, 
  Activity,
  BarChart3,
  PieChart,
  Clock
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalPageViews: number;
    uniqueVisitors: number;
    uniqueSessions: number;
    averageViewsPerSession: number;
  };
  topPages: Array<{
    _id: string;
    views: number;
    title: string;
  }>;
  deviceStats: Record<string, number>;
  browserStats: Array<{
    _id: string;
    count: number;
  }>;
  eventStats: Array<{
    _id: string;
    count: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    count: number;
  }>;
  weeklyStats: Array<{
    day: number;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `/api/analytics/dashboard?from=${dateRange.from}&to=${dateRange.to}`
      );
      
      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange.from, dateRange.to]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const getDayName = (day: number) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[day - 1] || 'Неизвестно';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-purple-600" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center text-red-400">
          <h2 className="text-2xl font-bold mb-4">Ошибка загрузки</h2>
          <p>Не удалось загрузить данные аналитики</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Аналитика</h1>
        <p className="text-gray-400">Обзор статистики и активности сайта</p>
      </div>

      {/* Фильтры по датам */}
      <div className="mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-400 mb-1">С даты</label>
          <Input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="bg-neutral-700 border-neutral-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">По дату</label>
          <Input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="bg-neutral-700 border-neutral-600 text-white"
          />
        </div>
        <Button onClick={fetchAnalytics} className="bg-accent hover:bg-accent/80">
          Обновить
        </Button>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Просмотры страниц</CardTitle>
            <Eye className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatNumber(analytics.overview.totalPageViews)}</div>
            <p className="text-xs text-gray-400">за выбранный период</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Уникальные посетители</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatNumber(analytics.overview.uniqueVisitors)}</div>
            <p className="text-xs text-gray-400">по IP адресам</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Сессии</CardTitle>
            <Activity className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatNumber(analytics.overview.uniqueSessions)}</div>
            <p className="text-xs text-gray-400">уникальные сессии</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Среднее время</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.overview.averageViewsPerSession.toFixed(1)}</div>
            <p className="text-xs text-gray-400">просмотров на сессию</p>
          </CardContent>
        </Card>
      </div>

      {/* Графики и диаграммы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Почасовая активность */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Почасовая активность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.hourlyStats.map((stat) => (
                <div key={stat.hour} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-8">{stat.hour}:00</span>
                  <div className="flex-1 bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(stat.count / Math.max(...analytics.hourlyStats.map(s => s.count))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-white w-12 text-right">{stat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Активность по дням недели */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Активность по дням недели
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.weeklyStats.map((stat) => (
                <div key={stat.day} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-8">{getDayName(stat.day)}</span>
                  <div className="flex-1 bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(stat.count / Math.max(...analytics.weeklyStats.map(s => s.count))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-white w-12 text-right">{stat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Детальная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ страниц */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Топ страниц по просмотрам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPages.slice(0, 8).map((page, index) => (
                <div key={page._id} className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-purple-400">#{index + 1}</span>
                    <div className="max-w-xs">
                      <p className="text-white text-sm font-medium truncate">{page.title || page._id}</p>
                      <p className="text-gray-400 text-xs truncate">{page._id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm font-medium">{formatNumber(page.views)}</div>
                    <div className="text-gray-400 text-xs">просмотров</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Статистика по устройствам и браузерам */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Устройства и браузеры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Устройства */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Устройства</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.deviceStats).map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between">
                      <span className="text-white text-sm capitalize">{device}</span>
                      <span className="text-gray-400 text-sm">{formatNumber(count)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Браузеры */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Браузеры</h4>
                <div className="space-y-2">
                  {analytics.browserStats.slice(0, 5).map((browser) => (
                    <div key={browser._id} className="flex items-center justify-between">
                      <span className="text-white text-sm">{browser._id}</span>
                      <span className="text-gray-400 text-sm">{formatNumber(browser.count)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* События */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">События</h4>
                <div className="space-y-2">
                  {analytics.eventStats.slice(0, 5).map((event) => (
                    <div key={event._id} className="flex items-center justify-between">
                      <span className="text-white text-sm capitalize">{event._id}</span>
                      <span className="text-gray-400 text-sm">{formatNumber(event.count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 