import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AdvertisingAnalytics from '@/models/AdvertisingAnalytics';
import { addServerLog } from '@/lib/serverLog';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 1d, 7d, 30d, 90d, all
    const utmSource = searchParams.get('utmSource');
    const utmCampaign = searchParams.get('utmCampaign');
    const utmMedium = searchParams.get('utmMedium');
    
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
      visitDate: { $gte: startDate.toISOString().split('T')[0] },
      page: { $not: /^\/admin/ } // Исключаем страницы админки
    };
    
    if (utmSource) matchConditions.utmSource = utmSource;
    if (utmCampaign) matchConditions.utmCampaign = utmCampaign;
    if (utmMedium) matchConditions.utmMedium = utmMedium;
    
    // 1. Общая рекламная статистика
    const totalStats = await AdvertisingAnalytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$anonymousSessionId' },
          firstTimeVisitors: { $sum: { $cond: ['$isFirstVisit', 1, 0] } },
          returnVisitors: { $sum: { $cond: ['$isFirstVisit', 0, 1] } },
          totalConversions: { $sum: { $cond: [{ $ne: ['$conversionGoal', null] }, 1, 0] } },
          totalConversionValue: { $sum: '$conversionValue' },
          averageTimeOnPage: { $avg: '$timeOnPage' },
          bounceRate: { $avg: { $cond: ['$isBounce', 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          totalVisits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          firstTimeVisitors: 1,
          returnVisitors: 1,
          totalConversions: 1,
          totalConversionValue: { $round: ['$totalConversionValue', 2] },
          averageTimeOnPage: { $round: ['$averageTimeOnPage', 2] },
          bounceRate: { $round: [{ $multiply: ['$bounceRate', 100] }, 2] }
        }
      }
    ]);
    
    // 2. Топ UTM-источников
    const topUtmSources = await AdvertisingAnalytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$utmSource',
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$anonymousSessionId' },
          conversions: { $sum: { $cond: [{ $ne: ['$conversionGoal', null] }, 1, 0] } },
          conversionValue: { $sum: '$conversionValue' }
        }
      },
      {
        $project: {
          _id: 0,
          utmSource: '$_id',
          visits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          conversions: 1,
          conversionValue: { $round: ['$conversionValue', 2] }
        }
      },
      { $sort: { visits: -1 } },
      { $limit: 20 }
    ]);
    
    // 3. Топ рекламных кампаний
    const topCampaigns = await AdvertisingAnalytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$utmCampaign',
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$anonymousSessionId' },
          conversions: { $sum: { $cond: [{ $ne: ['$conversionGoal', null] }, 1, 0] } },
          conversionValue: { $sum: '$conversionValue' },
          utmSource: { $first: '$utmSource' },
          utmMedium: { $first: '$utmMedium' }
        }
      },
      {
        $project: {
          _id: 0,
          utmCampaign: '$_id',
          visits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          conversions: 1,
          conversionValue: { $round: ['$conversionValue', 2] },
          utmSource: 1,
          utmMedium: 1
        }
      },
      { $sort: { visits: -1 } },
      { $limit: 20 }
    ]);
    
    // 4. Топ типов рекламы
    const topUtmMediums = await AdvertisingAnalytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$utmMedium',
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$anonymousSessionId' },
          conversions: { $sum: { $cond: [{ $ne: ['$conversionGoal', null] }, 1, 0] } },
          conversionValue: { $sum: '$conversionValue' }
        }
      },
      {
        $project: {
          _id: 0,
          utmMedium: '$_id',
          visits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          conversions: 1,
          conversionValue: { $round: ['$conversionValue', 2] }
        }
      },
      { $sort: { visits: -1 } }
    ]);
    
    // 5. Конверсии по целям
    const conversionsByGoal = await AdvertisingAnalytics.aggregate([
      { $match: { ...matchConditions, conversionGoal: { $ne: null } } },
      {
        $group: {
          _id: '$conversionGoal',
          count: { $sum: 1 },
          totalValue: { $sum: '$conversionValue' },
          uniqueVisitors: { $addToSet: '$anonymousSessionId' }
        }
      },
      {
        $project: {
          _id: 0,
          goal: '$_id',
          count: 1,
          totalValue: { $round: ['$totalValue', 2] },
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // 6. Статистика по времени (часы дня по МСК)
    const hourlyStats = await AdvertisingAnalytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$visitHour',
          visits: { $sum: 1 },
          conversions: { $sum: { $cond: [{ $ne: ['$conversionGoal', null] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          hour: '$_id',
          visits: 1,
          conversions: 1
        }
      },
      { $sort: { hour: 1 } }
    ]);
    
    // 7. Статистика по дням недели (по МСК)
    const weeklyStats = await AdvertisingAnalytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$visitDayOfWeek',
          visits: { $sum: 1 },
          conversions: { $sum: { $cond: [{ $ne: ['$conversionGoal', null] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          dayOfWeek: '$_id',
          visits: 1,
          conversions: 1
        }
      },
      { $sort: { dayOfWeek: 1 } }
    ]);
    
    // 8. Статистика по регионам
    const regionStats = await AdvertisingAnalytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$region',
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$anonymousSessionId' },
          conversions: { $sum: { $cond: [{ $ne: ['$conversionGoal', null] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          region: '$_id',
          visits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          conversions: 1
        }
      },
      { $sort: { visits: -1 } }
    ]);
    
    const stats = {
      period,
      startDate: startDate.toISOString(),
      total: totalStats[0] || {
        totalVisits: 0,
        uniqueVisitors: 0,
        firstTimeVisitors: 0,
        returnVisitors: 0,
        totalConversions: 0,
        totalConversionValue: 0,
        averageTimeOnPage: 0,
        bounceRate: 0
      },
      topUtmSources,
      topCampaigns,
      topUtmMediums,
      conversionsByGoal,
      hourlyStats,
      weeklyStats,
      regionStats
    };
    
    addServerLog('info', 'advertising-analytics-stats', 'Advertising analytics stats retrieved successfully', { 
      period, 
      utmSource, 
      utmCampaign,
      totalVisits: stats.total.totalVisits
    });
    
    return NextResponse.json({ 
      success: true, 
      data: stats 
    });

  } catch (error) {
    console.error('Advertising analytics stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'advertising-analytics-stats', 'Error retrieving advertising analytics stats', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
