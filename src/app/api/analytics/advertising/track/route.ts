import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AdvertisingAnalytics from '@/models/AdvertisingAnalytics';
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
      isBounce,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      isFirstVisit,
      conversionGoal,
      conversionValue
    } = body;

    // Не отслеживаем аналитику для страниц админки
    if (page && page.startsWith('/admin')) {
      addServerLog('info', 'advertising-analytics-track', 'Admin page skipped', { page });
      return NextResponse.json({ 
        success: true, 
        message: 'Admin page skipped' 
      });
    }

    // Валидация обязательных полей
    if (!anonymousSessionId || !page || !pageType || !deviceCategory || !region || !visitDate) {
      addServerLog('error', 'advertising-analytics-track', 'Missing required fields', { body });
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Создаем запись рекламной аналитики
    const advertisingAnalytics = new AdvertisingAnalytics({
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
      isBounce: isBounce !== undefined ? isBounce : true,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      isFirstVisit: isFirstVisit !== undefined ? isFirstVisit : true,
      conversionGoal,
      conversionValue,
      sessionStart: new Date()
    });

    await advertisingAnalytics.save();
    
    addServerLog('info', 'advertising-analytics-track', 'Advertising analytics data saved successfully', { 
      anonymousSessionId, 
      page, 
      pageType,
      utmSource,
      utmCampaign,
      region,
      deviceCategory 
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Advertising analytics data saved' 
    });

  } catch (error) {
    console.error('Advertising analytics track error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'advertising-analytics-track', 'Error saving advertising analytics data', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
