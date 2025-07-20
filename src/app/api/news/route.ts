import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { NewsModel } from '@/models/News';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Получаем только опубликованные новости, отсортированные по дате
    const news = await NewsModel.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();
    
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
} 