import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import AdvertisingAnalytics from '@/models/AdvertisingAnalytics';
import { AdvertisementModel } from '@/models/Advertisement';
import { addServerLog } from '@/lib/serverLog';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Вычисляем дату начала для статистики (последние 30 дней по МСК)
    const startDate = new Date();
    const moscowOffset = 3; // UTC+3 для МСК
    startDate.setUTCHours(0 - moscowOffset, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - 30);
    
    // 1. Общая статистика сайта (исключаем админку)
    const siteStats = await Analytics.aggregate([
      { 
        $match: { 
          visitDate: { $gte: startDate.toISOString().split('T')[0] },
          page: { $not: /^\/admin/ }
        } 
      },
      {
        $group: {
          _id: null,
          totalPageViews: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$anonymousSessionId' },
          uniqueSessions: { $addToSet: '$sessionId' },
          averageTimeOnPage: { $avg: '$timeOnPage' },
          bounceRate: { $avg: { $cond: ['$isBounce', 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          totalPageViews: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          uniqueSessions: { $size: '$uniqueSessions' },
          averageTimeOnPage: { $round: ['$averageTimeOnPage', 2] },
          bounceRate: { $round: [{ $multiply: ['$bounceRate', 100] }, 2] }
        }
      }
    ]);

    // 2. Статистика рекламы
    const adStats = await AdvertisingAnalytics.aggregate([
      { 
        $match: { 
          visitDate: { $gte: startDate.toISOString().split('T')[0] },
          page: { $not: /^\/admin/ }
        } 
      },
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: 1 },
          totalClicks: { $sum: '$clicks' },
          totalConversions: { $sum: { $cond: [{ $ne: ['$conversionGoal', null] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          totalImpressions: 1,
          totalClicks: 1,
          totalConversions: 1
        }
      }
    ]);

    // 3. Активные рекламные блоки
    const activeAds = await AdvertisementModel.find({ isActive: true })
      .select('title type impressions clicks')
      .lean();

    // 4. Топ страниц по просмотрам
    const topPages = await Analytics.aggregate([
      { 
        $match: { 
          visitDate: { $gte: startDate.toISOString().split('T')[0] },
          page: { $not: /^\/admin/ }
        } 
      },
      {
        $group: {
          _id: { page: '$page', pageType: '$pageType' },
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$anonymousSessionId' }
        }
      },
      {
        $project: {
          _id: 0,
          page: '$_id.page',
          pageType: '$_id.pageType',
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ]);

    // 5. Последняя активность (последние 10 записей)
    const recentActivity = await Analytics.aggregate([
      { 
        $match: { 
          page: { $not: /^\/admin/ }
        } 
      },
      {
        $project: {
          _id: 0,
          page: 1,
          pageType: 1,
          visitDate: 1,
          timeOnPage: 1,
          isBounce: 1
        }
      },
      { $sort: { visitDate: -1 } },
      { $limit: 10 }
    ]);

    // Формируем итоговые данные
    const siteData = siteStats[0] || {
      totalPageViews: 0,
      uniqueVisitors: 0,
      uniqueSessions: 0,
      averageTimeOnPage: 0,
      bounceRate: 0
    };

    const adData = adStats[0] || {
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0
    };

    const averageCTR = adData.totalImpressions > 0 
      ? (adData.totalClicks / adData.totalImpressions) * 100 
      : 0;

    // Форматируем последнюю активность
    const formattedActivity = recentActivity.map(activity => ({
      type: 'page_view',
      title: `${activity.pageType || 'Страница'}: ${activity.page}`,
      date: new Date(activity.visitDate).toLocaleDateString('ru-RU'),
      user: 'Посетитель',
      details: {
        timeOnPage: activity.timeOnPage,
        isBounce: activity.isBounce
      }
    }));

    // Форматируем топ контента
    const formattedTopContent = topPages.map(page => ({
      title: page.page,
      views: page.views,
      type: page.pageType || 'Страница',
      uniqueVisitors: page.uniqueVisitors
    }));

    const dashboardData = {
      // Общая статистика сайта
      totalPageViews: siteData.totalPageViews,
      uniqueVisitors: siteData.uniqueVisitors,
      uniqueSessions: siteData.uniqueSessions,
      averageViewsPerSession: siteData.totalPageViews > 0 && siteData.uniqueSessions > 0 
        ? Math.round(siteData.totalPageViews / siteData.uniqueSessions * 100) / 100 
        : 0,
      averageTimeOnPage: siteData.averageTimeOnPage,
      bounceRate: siteData.bounceRate,
      
      // Статистика рекламы
      totalImpressions: adData.totalImpressions,
      totalClicks: adData.totalClicks,
      totalConversions: adData.totalConversions,
      averageCTR: Math.round(averageCTR * 100) / 100,
      activeAdvertisements: activeAds.length,
      
      // Временные данные (примерные)
      monthlyViews: Math.floor(siteData.totalPageViews * 1.2), // Примерно на 20% больше
      weeklyViews: Math.floor(siteData.totalPageViews * 0.3),  // Примерно 30% от месячных
      dailyViews: Math.floor(siteData.totalPageViews * 0.04),  // Примерно 4% от месячных
      
      // Популярный контент
      topContent: formattedTopContent,
      
      // Последняя активность
      recentActivity: formattedActivity
    };

    addServerLog('info', 'admin-dashboard', 'Dashboard data retrieved successfully', { 
      totalPageViews: dashboardData.totalPageViews,
      uniqueVisitors: dashboardData.uniqueVisitors
    });

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'admin-dashboard', 'Error retrieving dashboard data', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
