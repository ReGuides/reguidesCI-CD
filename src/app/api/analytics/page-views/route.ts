import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Analytics from '@/models/Analytics';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { url, title, sessionId, userId, userAgent, referrer } = body;
    
    if (!url || !title || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: url, title, sessionId' },
        { status: 400 }
      );
    }

    const pageView = new Analytics({
      sessionId,
      userId: userId || undefined,
      page: url,
      pageType: 'page',
      userAgent: userAgent || request.headers.get('user-agent') || 'Unknown',
      browser: 'Unknown',
      browserVersion: 'Unknown',
      os: 'Unknown',
      osVersion: 'Unknown',
      device: 'desktop',
      screenResolution: 'Unknown',
      country: 'Unknown',
      timezone: 'UTC',
      language: 'en',
      timeOnPage: 0,
      isBounce: false,
      scrollDepth: 0,
      clicks: 0,
      loadTime: 0,
      isFirstVisit: false,
      timestamp: new Date()
    });

    await pageView.save();
    
    addServerLog('info', 'analytics-page-views', 'Page view tracked successfully', { 
      page: url, 
      sessionId, 
      userId 
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Page view tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-page-views', 'Error tracking page view', { error: errorMessage });
    
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const query: { timestamp?: { $gte: Date; $lte: Date } } = {};
    
    if (from && to) {
      // Устанавливаем начало дня для from в московском времени (00:00:00)
      const fromDate = new Date(from + 'T00:00:00+03:00');
      
      // Устанавливаем конец дня для to в московском времени (23:59:59.999)
      const toDate = new Date(to + 'T23:59:59.999+03:00');
      
      query.timestamp = {
        $gte: fromDate,
        $lte: toDate
      };
    }
    
    // Получаем просмотры страниц с фильтрацией
    const pageViews = await Analytics.aggregate([
      { $match: { ...query, pageType: 'page' } },
      {
        $addFields: {
          // Исключаем страницы админки
          isAdminPage: { $regexMatch: { input: '$page', regex: /\/admin/i } }
        }
      },
      { $match: { isAdminPage: false } },
      {
        $sort: { timestamp: -1 }
      },
      {
        $limit: limit
      }
    ]);
    
    addServerLog('info', 'analytics-page-views', 'Page views fetched successfully', { 
      count: pageViews.length,
      limit 
    });

    return NextResponse.json({ 
      success: true, 
      data: pageViews 
    });
  } catch (error) {
    console.error('Error fetching page views:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-page-views', 'Error fetching page views', { error: errorMessage });
    
    return NextResponse.json(
      { error: 'Failed to fetch page views' },
      { status: 500 }
    );
  }
}
