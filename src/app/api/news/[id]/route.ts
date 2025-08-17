import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import News, { INewsModel } from '@/models/News';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - получение новости по ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDB();
    
    const news = await News.findById(id)
      .populate('characterId', 'name image')
      .lean();

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }

    // Увеличиваем счетчик просмотров
    await News.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return NextResponse.json({
      success: true,
      data: news
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// PUT - обновление новости
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDB();
    
    const body = await request.json();
    const { title, content, type, image, isPublished, characterId, tags } = body;

    // Валидация
    if (!title || !content || !type) {
      return NextResponse.json(
        { success: false, error: 'Title, content and type are required' },
        { status: 400 }
      );
    }

    if (!['manual', 'birthday', 'update', 'event'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid news type' },
        { status: 400 }
      );
    }

    const updatedNews = await News.findByIdAndUpdate(
      id,
      {
        title,
        content,
        type,
        image,
        isPublished,
        characterId: characterId || undefined,
        tags: tags || [],
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedNews) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedNews,
      message: 'News updated successfully'
    });

  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update news' },
      { status: 500 }
    );
  }
}

// DELETE - удаление новости
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDB();
    
    const deletedNews = await News.findByIdAndDelete(id);

    if (!deletedNews) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'News deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete news' },
      { status: 500 }
    );
  }
}
