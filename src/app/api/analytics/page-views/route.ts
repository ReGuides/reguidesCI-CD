import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { PageViewModel } from '@/models/Analytics';
import { getClientIP } from '@/lib/utils/ip';

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

    const ip = getClientIP(request);
    
    const pageView = new PageViewModel({
      url,
      title,
      sessionId,
      userId: userId || null,
      ip,
      userAgent: userAgent || request.headers.get('user-agent'),
      referrer: referrer || request.headers.get('referer'),
      timestamp: new Date()
    });

    await pageView.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Page view tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
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
    const pageViews = await PageViewModel.aggregate([
      { $match: query },
      {
        $addFields: {
          // Исключаем страницы админки
          isAdminPage: { $regexMatch: { input: '$url', regex: /\/admin/i } }
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
    
    return NextResponse.json({ 
      success: true, 
      data: pageViews 
    });
  } catch (error) {
    console.error('Error fetching page views:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page views' },
      { status: 500 }
    );
  }
}
