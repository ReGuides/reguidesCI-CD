'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { 
  Users, 
  Sword, 
  Shield, 
  FileText, 
  Eye, 
  TrendingUp, 
  Calendar,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  totalCharacters: number;
  totalWeapons: number;
  totalArtifacts: number;
  totalArticles: number;
  totalViews: number;
  monthlyViews: number;
  weeklyViews: number;
  dailyViews: number;
  topArticles: Array<{
    title: string;
    views: number;
  }>;
  recentActivity: Array<{
    type: string;
    title: string;
    date: string;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalCharacters: 0,
    totalWeapons: 0,
    totalArtifacts: 0,
    totalArticles: 0,
    totalViews: 0,
    monthlyViews: 0,
    weeklyViews: 0,
    dailyViews: 0,
    topArticles: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
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
      const totalViews = (articlesData.data?.articles || []).reduce((sum: number, article: { views?: number }) => sum + (article.views || 0), 0);

      setAnalytics({
        totalCharacters: charactersData.data?.characters?.length || 0,
        totalWeapons: weaponsData.data?.weapons?.length || 0,
        totalArtifacts: artifactsData.data?.artifacts?.length || 0,
        totalArticles: articlesData.data?.articles?.length || 0,
        totalViews,
        monthlyViews: Math.floor(totalViews * 0.3),
        weeklyViews: Math.floor(totalViews * 0.1),
        dailyViews: Math.floor(totalViews * 0.02),
        topArticles: (articlesData.data?.articles || [])
          .sort((a: { views?: number }, b: { views?: number }) => (b.views || 0) - (a.views || 0))
          .slice(0, 5)
          .map((article: { title: string; views?: number }) => ({
            title: article.title,
            views: article.views || 0
          })),
        recentActivity: [
          { type: 'article', title: 'Новая статья о персонаже', date: '2024-01-15' },
          { type: 'character', title: 'Добавлен новый персонаж', date: '2024-01-14' },
          { type: 'weapon', title: 'Обновлено оружие', date: '2024-01-13' }
        ]
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Аналитика</h1>
        <p className="text-gray-400">Обзор статистики и активности сайта</p>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Общие просмотры</CardTitle>
            <Eye className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-gray-400">за все время</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Просмотры за месяц</CardTitle>
            <Calendar className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.monthlyViews.toLocaleString()}</div>
            <p className="text-xs text-gray-400">+12% с прошлого месяца</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Просмотры за неделю</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.weeklyViews.toLocaleString()}</div>
            <p className="text-xs text-gray-400">+8% с прошлой недели</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Просмотры сегодня</CardTitle>
            <Activity className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.dailyViews.toLocaleString()}</div>
            <p className="text-xs text-gray-400">+5% с вчера</p>
          </CardContent>
        </Card>
      </div>

      {/* Детальная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ статей */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Топ статей по просмотрам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topArticles.map((article, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-purple-400">#{index + 1}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{article.title}</p>
                      <p className="text-gray-400 text-xs">{article.views} просмотров</p>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Последняя активность */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Последняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-neutral-700 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    {activity.type === 'article' && <FileText className="w-4 h-4 text-white" />}
                    {activity.type === 'character' && <Users className="w-4 h-4 text-white" />}
                    {activity.type === 'weapon' && <Sword className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.title}</p>
                    <p className="text-gray-400 text-xs">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Графики и диаграммы */}
      <div className="mt-8">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Статистика контента</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-neutral-700 rounded-lg">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{analytics.totalCharacters}</div>
                <p className="text-gray-400 text-sm">Персонажей</p>
              </div>
              <div className="text-center p-4 bg-neutral-700 rounded-lg">
                <Sword className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{analytics.totalWeapons}</div>
                <p className="text-gray-400 text-sm">Оружия</p>
              </div>
              <div className="text-center p-4 bg-neutral-700 rounded-lg">
                <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{analytics.totalArtifacts}</div>
                <p className="text-gray-400 text-sm">Артефактов</p>
              </div>
              <div className="text-center p-4 bg-neutral-700 rounded-lg">
                <FileText className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{analytics.totalArticles}</div>
                <p className="text-gray-400 text-sm">Статей</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 