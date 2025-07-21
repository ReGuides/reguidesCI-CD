import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ArticleModel } from '@/models/Article';
import jwt from 'jsonwebtoken';
import { AdminJwtPayload } from '@/app/admin/AdminAuthContext';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getTokenFromRequest(request: NextRequest): string | null {
  // Сначала пробуем cookie (SSR/middleware), потом заголовок
  return (
    request.cookies.get('adminToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    null
  );
}

function verifyToken(request: NextRequest): AdminJwtPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    
    const query: Record<string, unknown> = {}; // Временно убираем фильтр по статусу
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    let articlesQuery = ArticleModel.find(query).sort({ createdAt: -1 });
    
    if (limit) {
      articlesQuery = articlesQuery.limit(parseInt(limit));
    }
    
    const articles = await articlesQuery;
    
    // Получаем уникальные значения для фильтров
    const statuses = await ArticleModel.distinct('status');
    const categories = await ArticleModel.distinct('category');
    
    return NextResponse.json({
      articles,
      filters: {
        statuses,
        categories,
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // --- Защита: только для авторизованных пользователей с ролью admin/editor ---
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'admin' && user.role !== 'editor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const data = await request.json();
    // Подставляем автора по id из токена
    const article = new ArticleModel({
      ...data,
      author: user.id,
    });
    await article.save();
    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Ошибка создания статьи', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 