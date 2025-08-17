'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/admin/stat-card';
import DashboardChart from '@/components/admin/dashboard-chart';
import RecentActivity from '@/components/admin/recent-activity';
import { 
  Users, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  BarChart3,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  activeAdvertisements: number;
  totalCharacters: number;
  totalArticles: number;
  totalWeapons: number;
}

interface ChartData {
  labels: string[];
  data: number[];
}

interface Advertisement {
  _id: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalImpressions: 0,
    totalClicks: 0,
    averageCTR: 0,
    activeAdvertisements: 0,
    totalCharacters: 0,
    totalArticles: 0,
    totalWeapons: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
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

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Данные для графиков
  const impressionsData: ChartData = {
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    data: [120, 190, 300, 500, 200, 300, 450]
  };

  const clicksData: ChartData = {
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    data: [12, 19, 30, 50, 20, 30, 45]
  };

  const ctrData: ChartData = {
    labels: ['CTR'],
    data: [stats.averageCTR]
  };

  // Данные для последних действий
  const recentActivities = [
    {
      id: '1',
      type: 'impression' as const,
      title: 'Новый показ рекламы',
      description: 'Реклама "Специальное предложение" показана 150 раз',
      time: '2 минуты назад',
      value: 150
    },
    {
      id: '2',
      type: 'click' as const,
      title: 'Клик по рекламе',
      description: 'Пользователь кликнул по рекламе "Новое оружие"',
      time: '5 минут назад',
      value: 1
    },
    {
      id: '3',
      type: 'user' as const,
      title: 'Новый пользователь',
      description: 'Зарегистрирован новый пользователь',
      time: '10 минут назад'
    },
    {
      id: '4',
      type: 'content' as const,
      title: 'Обновлена статья',
      description: 'Статья "Лучшие артефакты" была отредактирована',
      time: '15 минут назад'
    }
  ];

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
          title="Активные рекламы"
          value={stats.activeAdvertisements}
          icon={TrendingUp}
          color="purple"
          change={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Общие показы"
          value={stats.totalImpressions.toLocaleString()}
          icon={Eye}
          color="blue"
          change={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Общие клики"
          value={stats.totalClicks.toLocaleString()}
          icon={MousePointer}
          color="green"
          change={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Средний CTR"
          value={`${stats.averageCTR}%`}
          icon={BarChart3}
          color="yellow"
          change={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart
          data={impressionsData}
          type="bar"
          title="Показы по дням недели"
        />
        <DashboardChart
          data={clicksData}
          type="line"
          title="Клики по дням недели"
        />
      </div>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardChart
          data={ctrData}
          type="progress"
          title="Средний CTR"
        />
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
              <span className="text-gray-400">Статьи</span>
              <span className="text-white font-semibold">{stats.totalArticles}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Оружие</span>
              <span className="text-white font-semibold">{stats.totalWeapons}</span>
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
          </CardContent>
        </Card>
      </div>

      {/* Последние действия */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivities} />
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Производительность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Загрузка страниц</span>
                  <span className="text-green-400">2.3s</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Время отклика API</span>
                  <span className="text-yellow-400">150ms</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Доступность</span>
                  <span className="text-green-400">99.9%</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 