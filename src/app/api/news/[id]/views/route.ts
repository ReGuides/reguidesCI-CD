import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import News from '@/models/News';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    // Увеличиваем счетчик просмотров
    const updatedNews = await News.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!updatedNews) {
      return NextResponse.json(
        { error: 'Новость не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      views: updatedNews.views 
    });
    
  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
