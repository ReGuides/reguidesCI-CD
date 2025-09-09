import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import News from '@/models/News';

// Интерфейс для персонажа
interface Character {
  name: string;
  image: string;
}

// Интерфейс для query параметров
interface NewsQuery {
  type?: 'manual' | 'birthday' | 'update' | 'event' | 'article';
  category?: 'news' | 'guide' | 'review' | 'tutorial' | 'event';
  isPublished?: boolean;
  $or?: Array<{ 
    title?: { $regex: string; $options: string };
    content?: { $regex: string; $options: string };
    excerpt?: { $regex: string; $options: string };
  }>;
  tags?: { $in: string[] };
}

// Интерфейс для тела запроса при создании новости
interface CreateNewsRequest {
  title: string;
  content: string;
  type: 'manual' | 'birthday' | 'update' | 'event' | 'article';
  category?: 'news' | 'guide' | 'review' | 'tutorial' | 'event';
  excerpt?: string;
  image?: string;
  isPublished?: boolean;
  characterId?: string;
  tags?: string[];
  author?: string;
}

// GET - получение всех новостей
export async function GET(request: NextRequest) {
  try {
    // Проверяем подключение к БД
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connected successfully');

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const isPublished = searchParams.get('isPublished');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    console.log('Query parameters:', { type, category, isPublished, search, tags, sortBy, limit, page });

    const query: NewsQuery = {};
    
    if (type && ['manual', 'birthday', 'update', 'event', 'article'].includes(type)) {
      query.type = type as 'manual' | 'birthday' | 'update' | 'event' | 'article';
    }
    
    if (category && ['news', 'guide', 'review', 'tutorial', 'event'].includes(category)) {
      query.category = category as 'news' | 'guide' | 'review' | 'tutorial' | 'event';
    }
    
    if (isPublished !== null) {
      query.isPublished = isPublished === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Определяем сортировку
    let sortOptions: { createdAt?: 1 | -1; views?: 1 | -1 } = {};
    switch (sortBy) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'popular':
        sortOptions = { views: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    console.log('Executing query:', query);
    console.log('Sort options:', sortOptions);

    const [news, total] = await Promise.all([
      News.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('characterId', 'name image')
        .lean(),
      News.countDocuments(query)
    ]);

    console.log(`Found ${news.length} news items, total: ${total}`);

    // Добавляем информацию о персонаже
    const newsWithCharacter = news.map(item => {
      const character = item.characterId as Character;
      return {
        ...item,
        characterName: character ? character.name : undefined,
        characterImage: character ? character.image : undefined
      };
    });

    return NextResponse.json({
      success: true,
      data: newsWithCharacter,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Детальная информация об ошибке для отладки
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    };
    
    console.error('Error details:', errorDetails);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news',
        details: errorDetails
      },
      { status: 500 }
    );
  }
}

// POST - создание новой новости
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/news - Starting news creation...');
    
    // Проверяем подключение к БД
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connected successfully');
    
    console.log('Parsing request body...');
    const body: CreateNewsRequest = await request.json();
    console.log('Request body:', body);
    console.log('Request body type:', typeof body);
    console.log('Request body keys:', Object.keys(body));
    
    const { title, content, type, category, excerpt, image, isPublished, characterId, tags, author } = body;

    console.log('Extracted fields:');
    console.log('  title:', title, typeof title);
    console.log('  content:', content, typeof content);
    console.log('  type:', type, typeof type);
    console.log('  category:', category, typeof category);
    console.log('  excerpt:', excerpt, typeof excerpt);
    console.log('  image:', image, typeof image);
    console.log('  isPublished:', isPublished, typeof isPublished);
    console.log('  characterId:', characterId, typeof characterId);
    console.log('  tags:', tags, typeof tags);
    console.log('  author:', author, typeof author);

    // Валидация
    console.log('Validating input...');
    if (!title || !content || !type) {
      console.log('Validation failed: missing required fields');
      console.log('  title exists:', !!title);
      console.log('  content exists:', !!content);
      console.log('  type exists:', !!type);
      return NextResponse.json(
        { success: false, error: 'Title, content and type are required' },
        { status: 400 }
      );
    }

    console.log('Creating news object...');
    
    // Валидация category
    const validCategories = ['news', 'guide', 'review', 'tutorial', 'event'];
    const validCategory = (category && validCategories.includes(category)) ? category as string : 'news';
    
    console.log('Using category:', validCategory);
    console.log('Using excerpt:', excerpt || '');
    
    const news = new News({
      title,
      content,
      type,
      category: validCategory,
      excerpt: excerpt || '',
      image,
      isPublished: isPublished || false,
      characterId: characterId || undefined,
      tags: tags || [],
      author: author || 'Администратор'
    });

    console.log('Saving news to database...');
    await news.save();
    console.log('News saved successfully:', news._id);

    return NextResponse.json({
      success: true,
      data: news,
      message: 'News created successfully'
    });

  } catch (error) {
    console.error('Error creating news:', error);
    
    // Детальная информация об ошибке для отладки
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    };
    
    console.error('Error details:', errorDetails);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create news',
        details: errorDetails
      },
      { status: 500 }
    );
  }
} 