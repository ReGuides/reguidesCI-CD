import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { page } = body;

    // Не отслеживаем аналитику для страниц админки
    if (page && page.startsWith('/admin')) {
      addServerLog('info', 'analytics-dashboard', 'Admin page skipped', { page });
      return NextResponse.json({ 
        success: true, 
        message: 'Admin page skipped' 
      });
    }

    // Получаем статистику по странице
    const pageStats = await Analytics.aggregate([
      { $match: { $and: [{ page }, { page: { $not: /^\/admin/ } }] } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$anonymousSessionId' },
          averageTimeOnPage: { $avg: '$timeOnPage' },
          averageScrollDepth: { $avg: '$scrollDepth' },
          averageClicks: { $avg: '$clicks' },
          bounceRate: { $avg: { $cond: ['$isBounce', 1, 0] } },
          topRegions: { $addToSet: '$region' },
          topDevices: { $addToSet: '$deviceCategory' }
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
          topRegions: { $slice: ['$topRegions', 10] },
          topDevices: { $slice: ['$topDevices', 5] }
        }
      }
    ]);

    const stats = pageStats[0] || {
      totalViews: 0,
      uniqueVisitors: 0,
      averageTimeOnPage: 0,
      averageScrollDepth: 0,
      averageClicks: 0,
      bounceRate: 0,
      topRegions: [],
      topDevices: []
    };

    addServerLog('info', 'analytics-dashboard', 'Dashboard stats retrieved successfully', { 
      page, 
      totalViews: stats.totalViews 
    });

    return NextResponse.json({ 
      success: true, 
      data: stats 
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-dashboard', 'Error retrieving dashboard stats', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
