import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { page, pageType, pageId } = body;

    // Не отслеживаем аналитику для страниц админки
    if (page && page.startsWith('/admin')) {
      addServerLog('info', 'analytics-events', 'Admin page skipped', { page });
      return NextResponse.json({ 
        success: true, 
        message: 'Admin page skipped' 
      });
    }

    // Создаем запись события (анонимную)
    const event = new Analytics({
      anonymousSessionId: 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      page: page || '/',
      pageType: pageType || 'other',
      pageId,
      deviceCategory: 'desktop', // По умолчанию
      screenSize: 'medium', // По умолчанию
      region: 'unknown', // По умолчанию
      visitDate: new Date().toISOString().split('T')[0],
      visitHour: new Date().getHours(),
      visitDayOfWeek: new Date().getDay() || 7,
      timeOnPage: 0,
      scrollDepth: 0,
      clicks: 1, // Событие = 1 клик
      loadTime: 0,
      isBounce: false
    });

    await event.save();
    
    addServerLog('info', 'analytics-events', 'Event tracked successfully', { 
      page, 
      pageType,
      pageId 
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Event tracked' 
    });

  } catch (error) {
    console.error('Analytics events error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-events', 'Error tracking event', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const pageType = searchParams.get('pageType');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Базовые условия для фильтрации (исключаем админку)
    const matchConditions: Record<string, unknown> = { 
      pageType: 'other',
      page: { $not: /^\/admin/ }
    };
    
    if (page) matchConditions.page = page;
    if (pageType) matchConditions.pageType = pageType;
    
    // Получаем события
    const events = await Analytics.find(matchConditions)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('page pageType pageId visitDate visitHour clicks createdAt');
    
    addServerLog('info', 'analytics-events', 'Events retrieved successfully', { 
      count: events.length,
      page,
      pageType 
    });
    
    return NextResponse.json({ 
      success: true, 
      data: events 
    });

  } catch (error) {
    console.error('Analytics events error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-events', 'Error retrieving events', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
