import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { eventType, eventName, sessionId, userId, page } = body;
    
    if (!eventType || !eventName || !sessionId || !page) {
      addServerLog('error', 'analytics-events', 'Missing required fields', { body });
      return NextResponse.json(
        { error: 'Missing required fields: eventType, eventName, sessionId, page' },
        { status: 400 }
      );
    }

    // Создаем запись аналитики для события
    const analytics = new Analytics({
      sessionId,
      userId: userId || undefined,
      page,
      pageType: 'other',
      userAgent: 'Event Tracking',
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
      clicks: 1, // Событие = 1 клик
      loadTime: 0,
      isFirstVisit: false,
      timestamp: new Date()
    });

    await analytics.save();
    
    addServerLog('info', 'analytics-events', 'Event tracked successfully', { 
      eventType, 
      eventName, 
      sessionId, 
      page 
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Event tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-events', 'Error tracking event', { error: errorMessage });
    
    return NextResponse.json(
      { error: 'Failed to track event' },
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
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const query: { timestamp?: { $gte: Date; $lte: Date }; eventType?: string } = {};
    
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
    
    if (eventType) {
      query.eventType = eventType;
    }
    
    // Получаем события с фильтрацией
    const events = await Analytics.aggregate([
      { $match: query },
      {
        $addFields: {
          // Исключаем события на страницах админки
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
    
    addServerLog('info', 'analytics-events', 'Events fetched successfully', { 
      count: events.length,
      eventType,
      limit 
    });

    return NextResponse.json({ 
      success: true, 
      data: events 
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-events', 'Error fetching events', { error: errorMessage });
    
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
