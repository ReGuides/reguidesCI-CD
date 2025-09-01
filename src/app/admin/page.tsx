'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/admin/stat-card';
import { 
  Users, 
  Eye, 
  TrendingUp, 
  BarChart3,
  FileText,
  Activity,
  Clock,
  Target
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  // Общая статистика сайта
  totalPageViews: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  averageViewsPerSession: number;
  averageTimeOnPage: number;
  bounceRate: number;
  
  // Статистика рекламы
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCTR: number;
  activeAdvertisements: number;
  
  // Контент сайта
  totalCharacters: number;
  totalWeapons: number;
  totalArtifacts: number;
  totalArticles: number;
  totalBuilds: number;
  
  // Популярный контент
  topContent: Array<{
    title: string;
    views: number;
    type: string;
    uniqueVisitors: number;
  }>;
  
  // Последняя активность
  recentActivity: Array<{
    type: string;
    title: string;
    date: string;
    user: string;
    details?: {
      timeOnPage: number;
      isBounce: boolean;
    };
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPageViews: 0,
    uniqueVisitors: 0,
    uniqueSessions: 0,
    averageViewsPerSession: 0,
    averageTimeOnPage: 0,
    bounceRate: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    averageCTR: 0,
    activeAdvertisements: 0,
    totalCharacters: 0,
    totalWeapons: 0,
    totalArtifacts: 0,
    totalArticles: 0,
    totalBuilds: 0,
    topContent: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Загружаем данные дашборда
      const dashboardResponse = await fetch('/api/admin/dashboard');
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        if (dashboardData.success) {
          setStats(prev => ({
            ...prev,
            ...dashboardData.data
          }));
        }
      }
      
      // Загружаем статистику контента
      const contentResponse = await fetch('/api/admin/content-stats');
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        if (contentData.success) {
          setStats(prev => ({
            ...prev,
            totalCharacters: contentData.data.characters,
            totalWeapons: contentData.data.weapons,
            totalArtifacts: contentData.data.artifacts,
            totalArticles: contentData.data.articles,
            totalBuilds: contentData.data.builds
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'page_view':
        return <Eye className="w-4 h-4 text-white" />;
      case 'click':
        return <Target className="w-4 h-4 text-white" />;
      case 'conversion':
        return <TrendingUp className="w-4 h-4 text-white" />;
      default:
        return <Activity className="w-4 h-4 text-white" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'page_view':
        return 'bg-blue-500';
      case 'click':
        return 'bg-green-500';
      case 'conversion':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
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
          <p className="text-gray-400">Обзор статистики и ключевых метрик сайта</p>
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

      {/* Основные метрики */}
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
          value={stats.totalCharacters + stats.totalWeapons + stats.totalArtifacts + stats.totalArticles}
          icon={FileText}
          color="yellow"
        />
      </div>

      {/* Дополнительные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Среднее время на странице"
          value={`${Math.round(stats.averageTimeOnPage)}с`}
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Процент отказов"
          value={`${stats.bounceRate}%`}
          icon={Users}
          color="red"
        />
        <StatCard
          title="CTR рекламы"
          value={`${stats.averageCTR}%`}
          icon={Target}
          color="pink"
        />
        <StatCard
          title="Конверсии"
          value={stats.totalConversions.toLocaleString()}
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Детальная статистика */}
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
              <span className="text-gray-400">Конверсии</span>
              <span className="text-white font-semibold">{stats.totalConversions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Средний CTR</span>
              <span className="text-white font-semibold">{stats.averageCTR}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Контент сайта</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Персонажи</span>
              <span className="text-white font-semibold">{stats.totalCharacters}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Оружие</span>
              <span className="text-white font-semibold">{stats.totalWeapons}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Артефакты</span>
              <span className="text-white font-semibold">{stats.totalArtifacts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Статьи</span>
              <span className="text-white font-semibold">{stats.totalArticles}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-neutral-700">
              <span className="text-gray-300 font-medium">Всего контента</span>
              <span className="text-white font-bold text-lg">{stats.totalCharacters + stats.totalWeapons + stats.totalArtifacts + stats.totalArticles}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-white">Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/characters/add">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Users className="w-4 h-4 mr-2" />
                Добавить персонажа
              </Button>
            </Link>
            <Link href="/admin/weapons/add">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Target className="w-4 h-4 mr-2" />
                Добавить оружие
              </Button>
            </Link>
            <Link href="/admin/artifacts/add">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <FileText className="w-4 h-4 mr-2" />
                Добавить артефакт
              </Button>
            </Link>
            <Link href="/admin/articles/add">
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                <FileText className="w-4 h-4 mr-2" />
                Добавить статью
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Популярный контент и активность */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Популярный контент</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topContent.length > 0 ? (
                stats.topContent.map((item, index) => (
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

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Последняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 5).map((activity, index) => (
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
      </div>
    </div>
  );
} 