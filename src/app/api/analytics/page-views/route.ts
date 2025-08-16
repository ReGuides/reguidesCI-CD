import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { PageViewModel } from '@/models/Analytics';
import { getClientIP } from '@/lib/utils/ip';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
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
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    let query: any = {};
    
    if (from && to) {
      query.timestamp = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }
    
    const pageViews = await PageViewModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
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
