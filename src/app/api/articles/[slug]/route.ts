import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ArticleModel } from '@/models/Article';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    
    const { slug } = await params;
    
    // Получаем статью по slug
    const article = await ArticleModel.findOne({ 
      slug
    }).lean();
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Увеличиваем счетчик просмотров
    await ArticleModel.updateOne(
      { slug },
      { $inc: { views: 1 } }
    );

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 