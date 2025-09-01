import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const {
      sessionId,
      userId,
      page,
      pageType,
      pageId,
      userAgent,
      browser,
      browserVersion,
      os,
      osVersion,
      device,
      screenResolution,
      country,
      city,
      timezone,
      language,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      timeOnPage,
      isBounce,
      scrollDepth,
      clicks,
      loadTime,
      isFirstVisit
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
    if (!sessionId || !page || !pageType || !userAgent || !device || !country) {
      addServerLog('error', 'analytics-track', 'Missing required fields', { body });
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Создаем запись аналитики
    const analytics = new Analytics({
      sessionId,
      userId,
      page,
      pageType,
      pageId,
      userAgent,
      browser: browser || 'Unknown',
      browserVersion: browserVersion || 'Unknown',
      os: os || 'Unknown',
      osVersion: osVersion || 'Unknown',
      device,
      screenResolution: screenResolution || 'Unknown',
      country,
      city,
      timezone: timezone || 'UTC',
      language: language || 'en',
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      timeOnPage: timeOnPage || 0,
      isBounce: isBounce !== undefined ? isBounce : true,
      scrollDepth: scrollDepth || 0,
      clicks: clicks || 0,
      loadTime: loadTime || 0,
      isFirstVisit: isFirstVisit !== undefined ? isFirstVisit : true
    });

    await analytics.save();
    
    addServerLog('info', 'analytics-track', 'Analytics data saved successfully', { 
      sessionId, 
      page, 
      pageType,
      country,
      device 
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
