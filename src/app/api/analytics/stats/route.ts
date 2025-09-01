import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import { addServerLog } from '@/lib/serverLog';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 1d, 7d, 30d, 90d, all
    const pageType = searchParams.get('pageType');
    const pageId = searchParams.get('pageId');
    
    // Вычисляем дату начала периода (по МСК)
    let startDate = new Date();
    
    // Устанавливаем время в 00:00:00 по МСК для текущего дня
    const moscowOffset = 3; // UTC+3 для МСК
    startDate.setUTCHours(0 - moscowOffset, 0, 0, 0);
    
    switch (period) {
      case '1d':
        startDate.setUTCDate(startDate.getUTCDate() - 1);
        break;
      case '7d':
        startDate.setUTCDate(startDate.getUTCDate() - 7);
        break;
      case '30d':
        startDate.setUTCDate(startDate.getUTCDate() - 30);
        break;
      case '90d':
        startDate.setUTCDate(startDate.getUTCDate() - 90);
        break;
      case 'all':
        startDate = new Date(0); // 1970-01-01
        break;
    }
    
    // Базовые условия для фильтрации (исключаем админку)
    const matchConditions: Record<string, unknown> = { 
      timestamp: { $gte: startDate },
      page: { $not: /^\/admin/ } // Исключаем страницы админки
    };
    if (pageType) matchConditions.pageType = pageType;
    if (pageId) matchConditions.pageId = pageId;
    
    // 1. Общая статистика
    const totalStats = await Analytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalPageViews: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' },
          totalSessions: { $addToSet: '$sessionId' },
          averageTimeOnPage: { $avg: '$timeOnPage' },
          averageLoadTime: { $avg: '$loadTime' },
          bounceRate: { $avg: { $cond: ['$isBounce', 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          totalPageViews: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          totalSessions: { $size: '$totalSessions' },
          averageTimeOnPage: { $round: ['$averageTimeOnPage', 2] },
          averageLoadTime: { $round: ['$averageLoadTime', 2] },
          bounceRate: { $round: [{ $multiply: ['$bounceRate', 100] }, 2] }
        }
      }
    ]);
    
    // 2. Топ страниц
    const topPages = await Analytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: { page: '$page', pageType: '$pageType', pageId: '$pageId' },
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          _id: 0,
          page: '$_id.page',
          pageType: '$_id.pageType',
          pageId: '$_id.pageId',
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 20 }
    ]);
    
    // 3. Топ стран
    const topCountries = await Analytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$country',
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          _id: 0,
          country: '$_id',
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 20 }
    ]);
    
    // 4. Топ браузеров
    const topBrowsers = await Analytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$browser',
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          _id: 0,
          browser: '$_id',
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);
    
    // 5. Топ устройств
    const topDevices = await Analytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$device',
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          _id: 0,
          device: '$_id',
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { views: -1 } }
    ]);
    
    // 6. Топ операционных систем
    const topOS = await Analytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$os',
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          _id: 0,
          os: '$_id',
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);
    
    // 7. Статистика по времени (часы дня по МСК)
    const hourlyStats = await Analytics.aggregate([
      { $match: matchConditions },
      {
        $addFields: {
          moscowHour: {
            $hour: {
              date: '$timestamp',
              timezone: 'Europe/Moscow'
            }
          }
        }
      },
      {
        $group: {
          _id: '$moscowHour',
          views: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          hour: '$_id',
          views: 1
        }
      },
      { $sort: { hour: 1 } }
    ]);
    
    // 8. Статистика по дням недели (по МСК)
    const weeklyStats = await Analytics.aggregate([
      { $match: matchConditions },
      {
        $addFields: {
          moscowDayOfWeek: {
            $dayOfWeek: {
              date: '$timestamp',
              timezone: 'Europe/Moscow'
            }
          }
        }
      },
      {
        $group: {
          _id: '$moscowDayOfWeek',
          views: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          dayOfWeek: '$_id',
          views: 1
        }
      },
      { $sort: { dayOfWeek: 1 } }
    ]);
    
         // 9. Если указан pageId, получаем детальную статистику по странице
     let pageStats = null;
     if (pageId) {
       pageStats = await Analytics.aggregate([
         { $match: { pageId, timestamp: { $gte: startDate }, page: { $not: /^\/admin/ } } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$sessionId' },
            averageTimeOnPage: { $avg: '$timeOnPage' },
            averageScrollDepth: { $avg: '$scrollDepth' },
            averageClicks: { $avg: '$clicks' },
            bounceRate: { $avg: { $cond: ['$isBounce', 1, 0] } },
            topCountries: { $addToSet: '$country' },
            topDevices: { $addToSet: '$device' }
          }
        },
        {
          $project: {
            _id: 0,
            totalViews: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' },
            averageTimeOnPage: { $round: ['$averageTimeOnPage', 2] },
            averageScrollDepth: { $round: ['$averageScrollDepth', 2] },
            averageClicks: { $round: ['$averageClicks', 2] },
            bounceRate: { $round: [{ $multiply: ['$bounceRate', 100] }, 2] },
            topCountries: { $slice: ['$topCountries', 10] },
            topDevices: { $slice: ['$topDevices', 5] }
          }
        }
      ]);
      
      if (pageStats.length > 0) {
        pageStats = pageStats[0];
      }
    }
    
    const stats = {
      period,
      startDate: startDate.toISOString(),
      total: totalStats[0] || {
        totalPageViews: 0,
        uniqueVisitors: 0,
        totalSessions: 0,
        averageTimeOnPage: 0,
        averageLoadTime: 0,
        bounceRate: 0
      },
      topPages,
      topCountries,
      topBrowsers,
      topDevices,
      topOS,
      hourlyStats,
      weeklyStats,
      pageStats
    };
    
    addServerLog('info', 'analytics-stats', 'Analytics stats retrieved successfully', { 
      period, 
      pageType, 
      pageId,
      totalViews: stats.total.totalPageViews
    });
    
    return NextResponse.json({ 
      success: true, 
      data: stats 
    });

  } catch (error) {
    console.error('Analytics stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-stats', 'Error retrieving analytics stats', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
