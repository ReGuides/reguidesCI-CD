'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/admin/stat-card';
import { 
  Users, 
  Eye, 
  MousePointer,
  TrendingUp, 
  BarChart3,
  FileText,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  // Общая статистика сайта
  totalPageViews: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  averageViewsPerSession: number;
  
  // Контент сайта
  totalCharacters: number;
  totalArticles: number;
  totalWeapons: number;
  totalArtifacts: number;
  
  // Статистика рекламы
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  activeAdvertisements: number;
  
  // Временные данные
  monthlyViews: number;
  weeklyViews: number;
  dailyViews: number;
  weeklyImpressions: number[];
  weeklyClicks: number[];
  dailyStats: {
    date: string;
    impressions: number;
    clicks: number;
  }[];
  
  // Популярный контент
  topContent: Array<{
    title: string;
    views: number;
    type: string;
  }>;
  
  // Последняя активность
  recentActivity: Array<{
    type: string;
    title: string;
    date: string;
    user: string;
  }>;
}

interface Advertisement {
  _id: string;
  title: string;
  type: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPageViews: 0,
    uniqueVisitors: 0,
    uniqueSessions: 0,
    averageViewsPerSession: 0,
    totalCharacters: 0,
    totalArticles: 0,
    totalWeapons: 0,
    totalArtifacts: 0,
    totalImpressions: 0,
    totalClicks: 0,
    averageCTR: 0,
    activeAdvertisements: 0,
    monthlyViews: 0,
    weeklyViews: 0,
    dailyViews: 0,
    weeklyImpressions: [],
    weeklyClicks: [],
    dailyStats: [],
    topContent: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Загружаем общую статистику сайта
      const analyticsResponse = await fetch('/api/analytics/dashboard');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.success) {
          setStats(prev => ({
            ...prev,
            totalPageViews: analyticsData.data.overview.totalPageViews || 0,
            uniqueVisitors: analyticsData.data.overview.uniqueVisitors || 0,
            uniqueSessions: analyticsData.data.overview.uniqueSessions || 0,
            averageViewsPerSession: analyticsData.data.overview.averageViewsPerSession || 0,
            monthlyViews: Math.floor((analyticsData.data.overview.totalPageViews || 0) * 0.3),
            weeklyViews: Math.floor((analyticsData.data.overview.totalPageViews || 0) * 0.1),
            dailyViews: Math.floor((analyticsData.data.overview.totalPageViews || 0) * 0.02),
            topContent: analyticsData.data.topContent || [],
            recentActivity: analyticsData.data.recentActivity || []
          }));
        }
      }
      
      // Загружаем статистику рекламы
      const adsResponse = await fetch('/api/advertisements');
      if (adsResponse.ok) {
        const adsData = await adsResponse.json();
        if (adsData.success) {
          const advertisements: Advertisement[] = adsData.data;
          const activeAds = advertisements.filter((ad: Advertisement) => ad.isActive);
          const totalImpressions = advertisements.reduce((sum: number, ad: Advertisement) => sum + (ad.impressions || 0), 0);
          const totalClicks = advertisements.reduce((sum: number, ad: Advertisement) => sum + (ad.clicks || 0), 0);
          const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

          setStats(prev => ({
            ...prev,
            totalImpressions,
            totalClicks,
            averageCTR: Math.round(averageCTR * 100) / 100,
            activeAdvertisements: activeAds.length
          }));
        }
      }

      // Загружаем статистику персонажей
      const charactersResponse = await fetch('/api/characters');
      if (charactersResponse.ok) {
        const charactersData = await charactersResponse.json();
        if (charactersData.success) {
          setStats(prev => ({
            ...prev,
            totalCharacters: charactersData.data.length
          }));
        }
      }

      // Загружаем статистику статей
      const articlesResponse = await fetch('/api/articles');
      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        if (articlesData.success) {
          setStats(prev => ({
            ...prev,
            totalArticles: articlesData.data.length
          }));
        }
      }

      // Загружаем статистику оружия
      const weaponsResponse = await fetch('/api/weapons');
      if (weaponsResponse.ok) {
        const weaponsData = await weaponsResponse.json();
        if (weaponsData.success) {
          setStats(prev => ({
            ...prev,
            totalWeapons: weaponsData.data.length
          }));
        }
      }

      // Загружаем статистику артефактов
      const artifactsResponse = await fetch('/api/artifacts');
      if (artifactsResponse.ok) {
        const artifactsData = await artifactsResponse.json();
        if (artifactsData.success) {
          setStats(prev => ({
            ...prev,
            totalArtifacts: artifactsData.data.length
          }));
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Обновляем данные каждые 5 минут
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);



  const getActivityColor = (type: string) => {
    switch (type) {
      case 'impression':
        return 'bg-blue-500';
      case 'click':
        return 'bg-green-500';
      case 'user':
        return 'bg-purple-500';
      case 'content':
        return 'bg-orange-500';
      case 'advertisement':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'impression':
        return <Eye className="w-4 h-4 text-white" />;
      case 'click':
        return <MousePointer className="w-4 h-4 text-white" />;
      case 'user':
        return <Users className="w-4 h-4 text-white" />;
      case 'content':
        return <FileText className="w-4 h-4 text-white" />;
      case 'advertisement':
        return <TrendingUp className="w-4 h-4 text-white" />;
      default:
        return <Activity className="w-4 h-4 text-white" />;
    }
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
          <h1 className="text-3xl font-bold text-white">Панель управления</h1>
          <p className="text-gray-400">Обзор статистики и ключевых метрик</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={fetchDashboardData}
            variant="outline" 
            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
          >
            <Activity className="w-4 h-4 mr-2" />
            Обновить
          </Button>
          <Link href="/admin/analytics">
            <Button variant="outline" className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Подробная аналитика
            </Button>
          </Link>
        </div>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Просмотры страниц"
          value={stats.totalPageViews.toLocaleString()}
          icon={Eye}
          color="blue"
        />
        <StatCard
          title="Уникальные посетители"
          value={stats.uniqueVisitors.toLocaleString()}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Активные рекламы"
          value={stats.activeAdvertisements}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Контент сайта"
          value={stats.totalCharacters + stats.totalArticles + stats.totalWeapons + stats.totalArtifacts}
          icon={FileText}
          color="yellow"
        />
      </div>

      {/* Быстрый обзор */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Статистика рекламы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Общие показы</span>
              <span className="text-white font-semibold">{stats.totalImpressions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Общие клики</span>
              <span className="text-white font-semibold">{stats.totalClicks.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Средний CTR</span>
              <span className="text-white font-semibold">{stats.averageCTR}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/advertisements/add">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                Добавить рекламу
              </Button>
            </Link>
            <Link href="/admin/characters/add">
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Добавить персонажа
              </Button>
            </Link>
            <Link href="/admin/articles/add">
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Добавить статью
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                Подробная аналитика
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Последние действия */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Последняя активность сайта</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 4).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-neutral-700/50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.title}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{activity.date}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>Нет данных об активности</p>
                  <p className="text-sm">Данные появятся после настройки аналитики</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Популярный контент</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topContent.length > 0 ? (
                stats.topContent.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-purple-400">#{index + 1}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{item.title}</p>
                        <p className="text-gray-400 text-xs">{item.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-white font-medium">{item.views.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>Нет данных о популярном контенте</p>
                  <p className="text-sm">Данные появятся после настройки аналитики</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 