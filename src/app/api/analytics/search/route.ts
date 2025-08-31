import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Analytics from '@/models/Analytics';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { query, sessionId, userId, resultsCount } = body;
    
    if (!query || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: query, sessionId' },
        { status: 400 }
      );
    }

    const searchQuery = new Analytics({
      sessionId,
      userId: userId || undefined,
      page: '/search',
      pageType: 'search',
      userAgent: 'Search Tracking',
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
      clicks: 1,
      loadTime: 0,
      isFirstVisit: false,
      timestamp: new Date()
    });

    await searchQuery.save();
    
    addServerLog('info', 'analytics-search', 'Search query tracked successfully', { 
      query, 
      sessionId, 
      userId,
      resultsCount 
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Search query tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking search query:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-search', 'Error tracking search query', { error: errorMessage });
    
    return NextResponse.json(
      { error: 'Failed to track search query' },
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
    
    // Получаем поисковые запросы с фильтрацией
    const searchQueries = await Analytics.aggregate([
      { $match: { ...query, pageType: 'search' } },
      {
        $addFields: {
          // Исключаем поиски на страницах админки
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
    
    addServerLog('info', 'analytics-search', 'Search queries fetched successfully', { 
      count: searchQueries.length,
      limit 
    });

    return NextResponse.json({ 
      success: true, 
      data: searchQueries 
    });
  } catch (error) {
    console.error('Error fetching search queries:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-search', 'Error fetching search queries', { error: errorMessage });
    
    return NextResponse.json(
      { error: 'Failed to fetch search queries' },
      { status: 500 }
    );
  }
}
