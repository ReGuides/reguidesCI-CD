import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { PageViewModel, EventModel } from '@/models/Analytics';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    let dateFilter: { $gte?: Date; $lte?: Date } = {};
    if (from && to) {
      // Устанавливаем начало дня для from в московском времени (00:00:00)
      const fromDate = new Date(from + 'T00:00:00+03:00');
      
      // Устанавливаем конец дня для to в московском времени (23:59:59.999)
      const toDate = new Date(to + 'T23:59:59.999+03:00');
      
      dateFilter = {
        $gte: fromDate,
        $lte: toDate
      };
    } else {
      // По умолчанию последние 30 дней в московском времени
      const now = new Date();
      const moscowOffset = 3 * 60 * 60 * 1000; // UTC+3 в миллисекундах
      const moscowTime = new Date(now.getTime() + moscowOffset);
      
      const thirtyDaysAgo = new Date(moscowTime);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      
      dateFilter = { $gte: thirtyDaysAgo };
    }

    // Получаем статистику просмотров страниц
    const pageViewsStats = await PageViewModel.aggregate([
      { $match: { timestamp: dateFilter } },
      {
        $group: {
          _id: null,
          totalPageViews: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ip' },
          uniqueSessions: { $addToSet: '$sessionId' }
        }
      }
    ]);

    // Получаем топ страниц
    const topPages = await PageViewModel.aggregate([
      { $match: { timestamp: dateFilter } },
      {
        $group: {
          _id: '$url',
          views: { $sum: 1 },
          title: { $first: '$title' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);

    // Получаем статистику по устройствам
    const deviceStats = await PageViewModel.aggregate([
      { $match: { timestamp: dateFilter } },
      {
        $addFields: {
          deviceType: {
            $cond: {
              if: { $regexMatch: { input: '$userAgent', regex: /Mobile|Android|iPhone/i } },
              then: 'mobile',
              else: {
                $cond: {
                  if: { $regexMatch: { input: '$userAgent', regex: /Tablet|iPad/i } },
                  then: 'tablet',
                  else: 'desktop'
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Получаем статистику по браузерам
    const browserStats = await PageViewModel.aggregate([
      { $match: { timestamp: dateFilter } },
      {
        $addFields: {
          browser: {
            $cond: {
              if: { $regexMatch: { input: '$userAgent', regex: /Chrome/i } },
              then: 'Chrome',
              else: {
                $cond: {
                  if: { $regexMatch: { input: '$userAgent', regex: /Firefox/i } },
                  then: 'Firefox',
                  else: {
                    $cond: {
                      if: { $regexMatch: { input: '$userAgent', regex: /Safari/i } },
                      then: 'Safari',
                      else: {
                        $cond: {
                          if: { $regexMatch: { input: '$userAgent', regex: /Edge/i } },
                          then: 'Edge',
                          else: 'Other'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$browser',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Получаем статистику событий
    const eventStats = await EventModel.aggregate([
      { $match: { timestamp: dateFilter } },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Получаем почасовую статистику
    const hourlyStats = await PageViewModel.aggregate([
      { $match: { timestamp: dateFilter } },
      {
        $addFields: {
          // Конвертируем время в московское (UTC+3)
          moscowTime: {
            $add: [
              '$timestamp',
              3 * 60 * 60 * 1000 // +3 часа в миллисекундах
            ]
          }
        }
      },
      {
        $group: {
          _id: { $hour: '$moscowTime' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Получаем статистику по дням недели
    const weeklyStats = await PageViewModel.aggregate([
      { $match: { timestamp: dateFilter } },
      {
        $addFields: {
          // Конвертируем время в московское (UTC+3)
          moscowTime: {
            $add: [
              '$timestamp',
              3 * 60 * 60 * 1000 // +3 часа в миллисекундах
            ]
          }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$moscowTime' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const stats = {
      overview: {
        totalPageViews: pageViewsStats[0]?.totalPageViews || 0,
        uniqueVisitors: pageViewsStats[0]?.uniqueVisitors?.length || 0,
        uniqueSessions: pageViewsStats[0]?.uniqueSessions?.length || 0,
        averageViewsPerSession: pageViewsStats[0]?.totalPageViews / (pageViewsStats[0]?.uniqueSessions?.length || 1) || 0
      },
      topPages,
      deviceStats: deviceStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>),
      browserStats,
      eventStats,
      hourlyStats: hourlyStats.map(stat => ({
        hour: stat._id,
        count: stat.count
      })),
      weeklyStats: weeklyStats.map(stat => ({
        day: stat._id,
        count: stat.count
      }))
    };

    return NextResponse.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
