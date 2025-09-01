import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const {
      anonymousSessionId,
      page,
      pageType,
      pageId,
      deviceCategory,
      screenSize,
      region,
      visitDate,
      visitHour,
      visitDayOfWeek,
      timeOnPage,
      scrollDepth,
      clicks,
      loadTime,
      isBounce
    } = body;

    // Не отслеживаем аналитику для страниц админки
    if (page.startsWith('/admin')) {
      addServerLog('info', 'analytics-track', 'Admin page skipped', { page });
      return NextResponse.json({ 
        success: true, 
        message: 'Admin page skipped' 
      });
    }

    // Валидация обязательных полей
    if (!anonymousSessionId || !page || !pageType || !deviceCategory || !region || !visitDate) {
      addServerLog('error', 'analytics-track', 'Missing required fields', { body });
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Создаем запись аналитики (без персональных данных)
    const analytics = new Analytics({
      anonymousSessionId,
      page,
      pageType,
      pageId,
      deviceCategory,
      screenSize: screenSize || 'medium',
      region,
      visitDate,
      visitHour: visitHour || 0,
      visitDayOfWeek: visitDayOfWeek || 1,
      timeOnPage: timeOnPage || 0,
      scrollDepth: scrollDepth || 0,
      clicks: clicks || 0,
      loadTime: loadTime || 0,
      isBounce: isBounce !== undefined ? isBounce : true
    });

    await analytics.save();
    
    addServerLog('info', 'analytics-track', 'Analytics data saved successfully', { 
      anonymousSessionId, 
      page, 
      pageType,
      region,
      deviceCategory 
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Analytics data saved' 
    });

  } catch (error) {
    console.error('Analytics track error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-track', 'Error saving analytics data', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
