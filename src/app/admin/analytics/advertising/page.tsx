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
  RefreshCw,
  Target,
  DollarSign,
  Repeat,
  Zap
} from 'lucide-react';

interface AdvertisingStats {
  period: string;
  startDate: string;
  total: {
    totalVisits: number;
    uniqueVisitors: number;
    firstTimeVisitors: number;
    returnVisitors: number;
    totalConversions: number;
    totalConversionValue: number;
    averageTimeOnPage: number;
    bounceRate: number;
  };
  topUtmSources: Array<{
    utmSource: string;
    visits: number;
    uniqueVisitors: number;
    conversions: number;
    conversionValue: number;
  }>;
  topCampaigns: Array<{
    utmCampaign: string;
    visits: number;
    uniqueVisitors: number;
    conversions: number;
    conversionValue: number;
    utmSource: string;
    utmMedium: string;
  }>;
  topUtmMediums: Array<{
    utmMedium: string;
    visits: number;
    uniqueVisitors: number;
    conversions: number;
    conversionValue: number;
  }>;
  conversionsByGoal: Array<{
    goal: string;
    count: number;
    totalValue: number;
    uniqueVisitors: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    visits: number;
    conversions: number;
  }>;
  weeklyStats: Array<{
    dayOfWeek: number;
    visits: number;
    conversions: number;
  }>;
  regionStats: Array<{
    region: string;
    visits: number;
    uniqueVisitors: number;
    conversions: number;
  }>;
}

export default function AdvertisingAnalyticsPage() {
  const [stats, setStats] = useState<AdvertisingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [selectedUtmSource, setSelectedUtmSource] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');

  const fetchAdvertisingAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period });
      if (selectedUtmSource) params.append('utmSource', selectedUtmSource);
      if (selectedCampaign) params.append('utmCampaign', selectedCampaign);
      
      const response = await fetch(`/api/analytics/advertising/stats?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching advertising analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisingAnalytics();
  }, [period, selectedUtmSource, selectedCampaign]);

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
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
          <h1 className="text-3xl font-bold text-white">Рекламная аналитика</h1>
          <p className="text-gray-400">Статистика эффективности рекламных кампаний и UTM-меток</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={fetchAdvertisingAnalytics}
            variant="outline" 
            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
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
          value={selectedUtmSource}
          onChange={(e) => setSelectedUtmSource(e.target.value)}
          className="bg-neutral-800 border border-neutral-600 text-white px-3 py-2 rounded-lg"
        >
          <option value="">Все источники</option>
          {stats?.topUtmSources.map((source) => (
            <option key={source.utmSource} value={source.utmSource}>
              {source.utmSource || 'Без UTM'}
            </option>
          ))}
        </select>
        
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="bg-neutral-800 border border-neutral-600 text-white px-3 py-2 rounded-lg"
        >
          <option value="">Все кампании</option>
          {stats?.topCampaigns.map((campaign) => (
            <option key={campaign.utmCampaign} value={campaign.utmCampaign}>
              {campaign.utmCampaign || 'Без названия'}
            </option>
          ))}
        </select>
      </div>

      {stats && (
        <>
          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-400">Всего визитов</CardTitle>
                <Eye className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.total.totalVisits)}</div>
                <p className="text-xs text-blue-300">По рекламе</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-400">Уникальные посетители</CardTitle>
                <Users className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.total.uniqueVisitors)}</div>
                <p className="text-xs text-green-300">Новые + возвраты</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-400">Конверсии</CardTitle>
                <Target className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.total.totalConversions)}</div>
                <p className="text-xs text-purple-300">Достигнутые цели</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-400">Стоимость конверсий</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(stats.total.totalConversionValue)}</div>
                <p className="text-xs text-orange-300">Общая ценность</p>
              </CardContent>
            </Card>
          </div>

          {/* Дополнительные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 border-cyan-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyan-400">Новые посетители</CardTitle>
                <Zap className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.total.firstTimeVisitors)}</div>
                <p className="text-xs text-cyan-300">Первый визит</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-pink-500/10 to-pink-600/10 border-pink-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-pink-400">Возвраты</CardTitle>
                <Repeat className="h-4 w-4 text-pink-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.total.returnVisitors)}</div>
                <p className="text-xs text-pink-300">Повторные визиты</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-400">Время на странице</CardTitle>
                <Clock className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatTime(stats.total.averageTimeOnPage)}</div>
                <p className="text-xs text-yellow-300">Среднее время</p>
              </CardContent>
            </Card>
          </div>

          {/* Топ UTM-источников */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Топ UTM-источников
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topUtmSources && stats.topUtmSources.slice(0, 10).map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-xs">
                        {source.utmSource || 'Без UTM'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400">
                        <Eye className="w-3 h-3 inline mr-1" />
                        {formatNumber(source.visits)}
                      </span>
                      <span className="text-gray-400">
                        <Users className="w-3 h-3 inline mr-1" />
                        {formatNumber(source.uniqueVisitors)}
                      </span>
                      <span className="text-gray-400">
                        <Target className="w-3 h-3 inline mr-1" />
                        {formatNumber(source.conversions)}
                      </span>
                      <span className="text-green-400 font-medium">
                        {formatCurrency(source.conversionValue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Топ рекламных кампаний */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Топ рекламных кампаний
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topCampaigns && stats.topCampaigns.slice(0, 10).map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-xs">
                        {campaign.utmMedium || 'unknown'}
                      </Badge>
                      <span className="text-white font-medium">{campaign.utmCampaign || 'Без названия'}</span>
                      <span className="text-gray-400 text-sm">({campaign.utmSource || 'Без UTM'})</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400">
                        <Eye className="w-3 h-3 inline mr-1" />
                        {formatNumber(campaign.visits)}
                      </span>
                      <span className="text-gray-400">
                        <Users className="w-3 h-3 inline mr-1" />
                        {formatNumber(campaign.uniqueVisitors)}
                      </span>
                      <span className="text-gray-400">
                        <Target className="w-3 h-3 inline mr-1" />
                        {formatNumber(campaign.conversions)}
                      </span>
                      <span className="text-green-400 font-medium">
                        {formatCurrency(campaign.conversionValue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Конверсии по целям */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Конверсии по целям
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.conversionsByGoal && stats.conversionsByGoal.map((goal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-xs">
                        {goal.goal}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400">
                        <Target className="w-3 h-3 inline mr-1" />
                        {formatNumber(goal.count)}
                      </span>
                      <span className="text-gray-400">
                        <Users className="w-3 h-3 inline mr-1" />
                        {formatNumber(goal.uniqueVisitors)}
                      </span>
                      <span className="text-green-400 font-medium">
                        {formatCurrency(goal.totalValue)}
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
                            style={{ width: `${(hour.visits / Math.max(...stats.hourlyStats.map(h => h.visits))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-400 text-sm w-12 text-right">
                          {formatNumber(hour.visits)}
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
                              style={{ width: `${(day.visits / Math.max(...stats.weeklyStats.map(d => d.visits))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-400 text-sm w-12 text-right">
                            {formatNumber(day.visits)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Статистика по регионам */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Статистика по регионам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.regionStats && stats.regionStats.map((region, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white">{getRegionName(region.region)}</span>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400">
                        <Eye className="w-3 h-3 inline mr-1" />
                        {formatNumber(region.visits)}
                      </span>
                      <span className="text-gray-400">
                        <Users className="w-3 h-3 inline mr-1" />
                        {formatNumber(region.uniqueVisitors)}
                      </span>
                      <span className="text-gray-400">
                        <Target className="w-3 h-3 inline mr-1" />
                        {formatNumber(region.conversions)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
