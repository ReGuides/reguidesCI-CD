import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import UserSession from '@/models/UserSession';
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
      addServerLog('info', 'analytics-track-improved', 'Admin page skipped', { page });
      return NextResponse.json({ 
        success: true, 
        message: 'Admin page skipped' 
      });
    }

    // Валидация обязательных полей
    if (!anonymousSessionId || !page || !pageType || !deviceCategory || !region || !visitDate) {
      addServerLog('error', 'analytics-track-improved', 'Missing required fields', { body });
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // 1. Обновляем или создаем сессию пользователя
    const sessionData = {
      sessionId: anonymousSessionId,
      firstVisit: new Date(),
      lastVisit: new Date(),
      visitCount: 1,
      totalTimeOnSite: timeOnPage || 0,
      pageViews: 1,
      deviceCategory,
      screenSize: screenSize || 'medium',
      region,
      isReturning: false,
      isEngaged: (timeOnPage || 0) > 30,
      lastPage: page,
      lastPageType: pageType
    };

    const existingSession = await UserSession.findOne({ sessionId: anonymousSessionId });
    
    if (existingSession) {
      // Обновляем существующую сессию
      existingSession.lastVisit = new Date();
      existingSession.visitCount += 1;
      existingSession.totalTimeOnSite += (timeOnPage || 0);
      existingSession.pageViews += 1;
      existingSession.isReturning = true;
      existingSession.isEngaged = existingSession.isEngaged || (timeOnPage || 0) > 30;
      existingSession.lastPage = page;
      existingSession.lastPageType = pageType;
      
      await existingSession.save();
    } else {
      // Создаем новую сессию
      const newSession = new UserSession(sessionData);
      await newSession.save();
    }

    // 2. Создаем запись аналитики (без персональных данных)
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
    
    addServerLog('info', 'analytics-track-improved', 'Analytics data saved successfully', { 
      anonymousSessionId, 
      page, 
      pageType,
      region,
      deviceCategory,
      isNewSession: !existingSession
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Analytics data saved',
      isNewSession: !existingSession
    });

  } catch (error) {
    console.error('Analytics track improved error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-track-improved', 'Error saving analytics data', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
