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
    await connectDB();
    
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

    const [news, total] = await Promise.all([
      News.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('characterId', 'name image')
        .lean(),
      News.countDocuments(query)
    ]);

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
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// POST - создание новой новости
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body: CreateNewsRequest = await request.json();
    const { title, content, type, category, excerpt, image, isPublished, characterId, tags, author } = body;

    // Валидация
    if (!title || !content || !type) {
      return NextResponse.json(
        { success: false, error: 'Title, content and type are required' },
        { status: 400 }
      );
    }

    // Валидация типа уже обеспечена TypeScript через интерфейс

    const news = new News({
      title,
      content,
      type,
      category: category || 'news',
      excerpt: excerpt || '',
      image,
      isPublished: isPublished || false,
      characterId: characterId || undefined,
      tags: tags || [],
      author: author || 'Администратор'
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