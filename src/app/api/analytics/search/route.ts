import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { SearchQueryModel } from '@/models/Analytics';
import { getClientIP } from '@/lib/utils/ip';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { query, sessionId, userId, resultsCount, clickedResult } = body;
    
    if (!query || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: query, sessionId' },
        { status: 400 }
      );
    }

    const ip = getClientIP(request);
    
    const searchQuery = new SearchQueryModel({
      query,
      sessionId,
      userId: userId || null,
      ip,
      resultsCount: resultsCount || 0,
      clickedResult: clickedResult || null,
      timestamp: new Date()
    });

    await searchQuery.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Search query tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking search query:', error);
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
    const searchQueries = await SearchQueryModel.aggregate([
      { $match: { timestamp: query.timestamp } },
      {
        $addFields: {
          // Исключаем поиски на страницах админки
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
      data: searchQueries 
    });
  } catch (error) {
    console.error('Error fetching search queries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search queries' },
      { status: 500 }
    );
  }
}
