import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { EventModel } from '@/models/Analytics';
import { getClientIP } from '@/lib/utils/ip';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { eventType, eventName, sessionId, userId, url, elementId, elementText, metadata } = body;
    
    if (!eventType || !eventName || !sessionId || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, eventName, sessionId, url' },
        { status: 400 }
      );
    }

    const ip = getClientIP(request);
    
    const event = new EventModel({
      eventType,
      eventName,
      sessionId,
      userId: userId || null,
      ip,
      url,
      elementId: elementId || null,
      elementText: elementText || null,
      metadata: metadata || {},
      timestamp: new Date()
    });

    await event.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Event tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking event:', error);
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
    
    const events = await EventModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({ 
      success: true, 
      data: events 
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
