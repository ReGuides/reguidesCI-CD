import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import News from '@/models/News';
import { auth } from '@/lib/auth';

// GET - получение всех новостей
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isPublished = searchParams.get('isPublished');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    let query: any = {};
    
    if (type) {
      query.type = type;
    }
    
    if (isPublished !== null) {
      query.isPublished = isPublished === 'true';
    }

    const [news, total] = await Promise.all([
      News.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('characterId', 'name image')
        .lean(),
      News.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// POST - создание новой новости
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
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

    const news = new News({
      title,
      content,
      type,
      image,
      isPublished: isPublished || false,
      characterId: characterId || undefined,
      tags: tags || [],
      author: session.user.name || 'Администратор'
    });

    await news.save();

    return NextResponse.json({
      success: true,
      data: news,
      message: 'News created successfully'
    });

  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create news' },
      { status: 500 }
    );
  }
} 