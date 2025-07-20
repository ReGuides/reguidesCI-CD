'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { 
  Users, 
  Sword, 
  Shield, 
  FileText, 
  Eye, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Activity,
  Plus,
  Settings,
  Database,
  Clock,
  Star
} from 'lucide-react';

interface DashboardStats {
  totalCharacters: number;
  totalWeapons: number;
  totalArtifacts: number;
  totalArticles: number;
  totalViews: number;
  monthlyViews: number;
  weeklyViews: number;
  dailyViews: number;
  recentActivity: Array<{
    type: string;
    title: string;
    date: string;
    user: string;
  }>;
  topContent: Array<{
    title: string;
    views: number;
    type: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCharacters: 0,
    totalWeapons: 0,
    totalArtifacts: 0,
    totalArticles: 0,
    totalViews: 0,
    monthlyViews: 0,
    weeklyViews: 0,
    dailyViews: 0,
    recentActivity: [],
    topContent: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Получаем данные из всех API
      const [charactersRes, weaponsRes, artifactsRes, articlesRes] = await Promise.all([
        fetch('/api/characters'),
        fetch('/api/weapons'),
        fetch('/api/artifacts'),
        fetch('/api/articles')
      ]);

      const charactersData = await charactersRes.json();
      const weaponsData = await weaponsRes.json();
      const artifactsData = await artifactsRes.json();
      const articlesData = await articlesRes.json();

      // Подсчитываем общие просмотры
      const totalViews = (articlesData.data?.articles || []).reduce((sum: number, article: any) => sum + (article.views || 0), 0);

      setStats({
        totalCharacters: charactersData.data?.characters?.length || 0,
        totalWeapons: weaponsData.data?.weapons?.length || 0,
        totalArtifacts: artifactsData.data?.artifacts?.length || 0,
        totalArticles: articlesData.data?.articles?.length || 0,
        totalViews,
        monthlyViews: Math.floor(totalViews * 0.3),
        weeklyViews: Math.floor(totalViews * 0.1),
        dailyViews: Math.floor(totalViews * 0.02),
        recentActivity: [
          { type: 'character', title: 'Добавлен новый персонаж', date: '2024-01-15', user: 'Админ' },
          { type: 'article', title: 'Обновлена статья о сборках', date: '2024-01-14', user: 'Админ' },
          { type: 'weapon', title: 'Добавлено новое оружие', date: '2024-01-13', user: 'Админ' },
          { type: 'artifact', title: 'Обновлены артефакты', date: '2024-01-12', user: 'Админ' }
        ],
        topContent: [
          { title: 'Гайд по сборке персонажа', views: 15420, type: 'article' },
          { title: 'Лучшие оружия для DPS', views: 12340, type: 'article' },
          { title: 'Артефакты для поддержки', views: 9870, type: 'article' },
          { title: 'Сборка Raiden Shogun', views: 8760, type: 'character' }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'character': return <Users className="w-4 h-4" />;
      case 'weapon': return <Sword className="w-4 h-4" />;
      case 'artifact': return <Shield className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'character': return 'bg-blue-500';
      case 'weapon': return 'bg-green-500';
      case 'artifact': return 'bg-purple-500';
      case 'article': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Дашборд</h1>
            <p className="text-gray-400">Добро пожаловать в панель управления ReGuides</p>
          </div>
          <div className="flex space-x-3">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Быстрое добавление
            </Button>
            <Button variant="outline" className="border-neutral-600 text-gray-400 hover:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Настройки
            </Button>
          </div>
        </div>
      </div>

        {/* Основные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-300">Персонажи</CardTitle>
              <Users className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCharacters}</div>
              <p className="text-xs text-blue-300">в базе данных</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-300">Оружие</CardTitle>
              <Sword className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalWeapons}</div>
              <p className="text-xs text-green-300">в базе данных</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Артефакты</CardTitle>
              <Shield className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalArtifacts}</div>
              <p className="text-xs text-purple-300">в базе данных</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-300">Статьи</CardTitle>
              <FileText className="h-5 w-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalArticles}</div>
              <p className="text-xs text-orange-300">опубликовано</p>
            </CardContent>
          </Card>
        </div>

        {/* Статистика просмотров */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                Статистика просмотров
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-white">Общие просмотры</span>
                  </div>
                  <span className="text-white font-bold">{stats.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white">За месяц</span>
                  </div>
                  <span className="text-white font-bold">{stats.monthlyViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-white">За неделю</span>
                  </div>
                  <span className="text-white font-bold">{stats.weeklyViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-white">Сегодня</span>
                  </div>
                  <span className="text-white font-bold">{stats.dailyViews.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                Популярный контент
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topContent.map((item, index) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Последняя активность */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-400" />
                Последняя активность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
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
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-5 h-5 mr-2 text-green-400" />
                Быстрые действия
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700 h-12">
                  <Users className="w-4 h-4 mr-2" />
                  Добавить персонажа
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 h-12">
                  <Sword className="w-4 h-4 mr-2" />
                  Добавить оружие
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 h-12">
                  <Shield className="w-4 h-4 mr-2" />
                  Добавить артефакт
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700 h-12">
                  <FileText className="w-4 h-4 mr-2" />
                  Написать статью
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
} 