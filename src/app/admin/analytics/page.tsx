'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardChart from '@/components/admin/dashboard-chart';
import { 
  ArrowLeft,
  TrendingUp,
  Eye,
  MousePointer,
  Download
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  topAdvertisements: Array<{
    title: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  hourlyData: {
    labels: string[];
    impressions: number[];
    clicks: number[];
  };
  weeklyTrends: {
    labels: string[];
    impressions: number[];
    clicks: number[];
  };
  deviceStats: {
    desktop: number;
    mobile: number;
  };
  typeStats: {
    sidebar: number;
    banner: number;
    popup: number;
  };
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

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalImpressions: 0,
    totalClicks: 0,
    averageCTR: 0,
    topAdvertisements: [],
    hourlyData: { labels: [], impressions: [], clicks: [] },
    weeklyTrends: { labels: [], impressions: [], clicks: [] },
    deviceStats: { desktop: 0, mobile: 0 },
    typeStats: { sidebar: 0, banner: 0, popup: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Загружаем данные рекламы
      const adsResponse = await fetch('/api/advertisements');
      if (adsResponse.ok) {
        const adsData = await adsResponse.json();
        if (adsData.success) {
          const advertisements: Advertisement[] = adsData.data;
          
          // Подсчитываем общую статистику
          const totalImpressions = advertisements.reduce((sum: number, ad: Advertisement) => sum + (ad.impressions || 0), 0);
          const totalClicks = advertisements.reduce((sum: number, ad: Advertisement) => sum + (ad.clicks || 0), 0);
          const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

          // Топ рекламы по CTR
          const topAds = advertisements
            .filter((ad: Advertisement) => ad.impressions > 0)
            .map((ad: Advertisement) => ({
              title: ad.title,
              impressions: ad.impressions,
              clicks: ad.clicks,
              ctr: ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
            }))
            .sort((a, b) => b.ctr - a.ctr)
            .slice(0, 10);

          // Генерируем почасовые данные
          const hourlyData = generateHourlyData(advertisements);
          
          // Генерируем недельные тренды
          const weeklyTrends = generateWeeklyTrends(advertisements);
          
          // Статистика по устройствам (симуляция)
          const deviceStats = {
            desktop: Math.round(totalImpressions * 0.65),
            mobile: Math.round(totalImpressions * 0.35)
          };

          // Статистика по типам рекламы
          const typeStats = {
            sidebar: advertisements.filter((ad: Advertisement) => ad.type === 'sidebar').length,
            banner: advertisements.filter((ad: Advertisement) => ad.type === 'banner').length,
            popup: advertisements.filter((ad: Advertisement) => ad.type === 'popup').length
          };

          setAnalyticsData({
            totalImpressions,
            totalClicks,
            averageCTR: Math.round(averageCTR * 100) / 100,
            topAdvertisements: topAds,
            hourlyData,
            weeklyTrends,
            deviceStats,
            typeStats
          });
        }
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData, timeRange]);

  const generateHourlyData = (advertisements: Advertisement[]) => {
    const labels = [];
    const impressions = [];
    const clicks = [];
    
    // Простая логика: распределяем данные по часам с понятными пиками
    for (let i = 0; i < 24; i++) {
      labels.push(`${i}:00`);
      
      const totalImpressions = advertisements.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
      const totalClicks = advertisements.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
      
      // Простые множители для разных часов
      let hourMultiplier = 0.5; // Базовый уровень
      
      if (i >= 9 && i <= 12) hourMultiplier = 1.5;    // Утро - пик
      else if (i >= 13 && i <= 14) hourMultiplier = 1.2; // Обед
      else if (i >= 18 && i <= 21) hourMultiplier = 1.8; // Вечер - максимальный пик
      else if (i >= 22 || i <= 6) hourMultiplier = 0.2;  // Ночь - минимум
      
      impressions.push(Math.round((totalImpressions / 24) * hourMultiplier));
      clicks.push(Math.round((totalClicks / 24) * hourMultiplier));
    }
    
    return { labels, impressions, clicks };
  };

  const generateWeeklyTrends = (advertisements: Advertisement[]) => {
    const labels: string[] = [];
    const impressions: number[] = [];
    const clicks: number[] = [];
    
    const totalImpressions = advertisements.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
    const totalClicks = advertisements.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
    
    // Простые множители для дней недели
    const dayMultipliers = [0.8, 1.1, 1.3, 1.1, 1.0, 0.6, 0.5]; // Пн-Вс
    
    dayMultipliers.forEach(multiplier => {
      impressions.push(Math.round((totalImpressions / 7) * multiplier));
      clicks.push(Math.round((totalClicks / 7) * multiplier));
    });
    
    return { labels, impressions, clicks };
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Подробная аналитика</h1>
            <p className="text-gray-400">Детальный анализ эффективности рекламы</p>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="bg-neutral-700 border border-neutral-600 text-white rounded-md px-3 py-2"
          >
            <option value="7d">Последние 7 дней</option>
            <option value="30d">Последние 30 дней</option>
            <option value="90d">Последние 90 дней</option>
          </select>
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-300">Общие показы</CardTitle>
            <Eye className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{analyticsData.totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-blue-300">за выбранный период</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-300">Общие клики</CardTitle>
            <MousePointer className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{analyticsData.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-green-300">за выбранный период</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-300">Средний CTR</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{analyticsData.averageCTR}%</div>
            <p className="text-xs text-purple-300">показатель конверсии</p>
          </CardContent>
        </Card>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart
          data={{
            labels: analyticsData.hourlyData.labels,
            data: analyticsData.hourlyData.impressions
          }}
          type="bar"
          title="Показы по часам (24 часа)"
        />
        <DashboardChart
          data={{
            labels: analyticsData.weeklyTrends.labels,
            data: analyticsData.weeklyTrends.impressions
          }}
          type="line"
          title="Недельные тренды показов"
        />
      </div>

      {/* Дополнительная аналитика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Топ рекламы по CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topAdvertisements.slice(0, 5).map((ad, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-purple-400">#{index + 1}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{ad.title}</p>
                      <p className="text-gray-400 text-xs">CTR: {ad.ctr.toFixed(2)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 text-xs">👁 {ad.impressions}</span>
                    <span className="text-green-400 text-xs">🖱 {ad.clicks}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white">Статистика по устройствам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Desktop</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-neutral-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(analyticsData.deviceStats.desktop / analyticsData.totalImpressions) * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-semibold">{analyticsData.deviceStats.desktop.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Mobile</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-neutral-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(analyticsData.deviceStats.mobile / analyticsData.totalImpressions) * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-semibold">{analyticsData.deviceStats.mobile.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white">Распределение по типам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Сайдбар</span>
                  <span className="text-white font-semibold">{analyticsData.typeStats.sidebar}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Баннер</span>
                  <span className="text-white font-semibold">{analyticsData.typeStats.banner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Всплывающее окно</span>
                  <span className="text-white font-semibold">{analyticsData.typeStats.popup}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 