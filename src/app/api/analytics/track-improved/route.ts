import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import UserSession from '@/models/UserSession';
import { addServerLog } from '@/lib/serverLog';

// Функция для расчета engagement score (0-100)
function calculateEngagementScore(timeOnSite: number, pageViews: number, clicks: number = 0): number {
  let score = 0;
  
  // Время на сайте (максимум 40 баллов)
  if (timeOnSite >= 60) score += 40; // 1+ минута
  else if (timeOnSite >= 30) score += 30; // 30+ секунд
  else if (timeOnSite >= 10) score += 20; // 10+ секунд
  else if (timeOnSite >= 5) score += 10; // 5+ секунд
  
  // Количество страниц (максимум 40 баллов)
  if (pageViews >= 5) score += 40; // 5+ страниц
  else if (pageViews >= 3) score += 30; // 3+ страницы
  else if (pageViews >= 2) score += 20; // 2+ страницы
  else if (pageViews >= 1) score += 10; // 1+ страница
  
  // Клики (максимум 20 баллов)
  if (clicks >= 5) score += 20; // 5+ кликов
  else if (clicks >= 3) score += 15; // 3+ клика
  else if (clicks >= 1) score += 10; // 1+ клик
  
  return Math.min(score, 100);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
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
    const initialTimeOnSite = timeOnPage || 0;
    const initialPageViews = 1;
    const initialClicks = clicks || 0;
    const initialEngagementScore = calculateEngagementScore(initialTimeOnSite, initialPageViews, initialClicks);
    
    const sessionData = {
      sessionId: anonymousSessionId,
      firstVisit: new Date(),
      lastVisit: new Date(),
      visitCount: 1,
      totalTimeOnSite: initialTimeOnSite,
      pageViews: initialPageViews,
      deviceCategory,
      screenSize: screenSize || 'medium',
      region,
      isReturning: false,
      isEngaged: initialEngagementScore >= 30, // Вовлеченный если score >= 30
      engagementScore: initialEngagementScore,
      lastPage: page,
      lastPageType: pageType
    };

    const existingSession = await UserSession.findOne({ sessionId: anonymousSessionId });
    
    if (existingSession) {
      // Обновляем существующую сессию (обновление страницы в той же сессии)
      existingSession.lastVisit = new Date();
      // НЕ увеличиваем visitCount - это та же сессия!
      existingSession.totalTimeOnSite += (timeOnPage || 0);
      existingSession.pageViews += 1;
      // НЕ меняем isReturning - это та же сессия!
      
      // Пересчитываем engagement score
      const newEngagementScore = calculateEngagementScore(
        existingSession.totalTimeOnSite, 
        existingSession.pageViews, 
        existingSession.clicks || 0
      );
      existingSession.engagementScore = newEngagementScore;
      existingSession.isEngaged = newEngagementScore >= 30;
      
      existingSession.lastPage = page;
      existingSession.lastPageType = pageType;
      
      await existingSession.save();
    } else {
      // Создаем новую сессию (новый визит)
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
