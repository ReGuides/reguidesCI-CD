import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ArticleModel } from '@/models/Article';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    
    let query: any = {}; // Временно убираем фильтр по статусу
    
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
      success: true,
      articles: articles.map(article => ({
        _id: article._id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        type: article.type,
        author: article.author,
        category: article.category,
        tags: article.tags,
        featuredImage: article.featuredImage,
        status: article.status,
        publishedAt: article.publishedAt,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        difficulty: article.difficulty,
        estimatedTime: article.estimatedTime,
        prerequisites: article.prerequisites,
        relatedArticles: article.relatedArticles,
        views: article.views,
        rating: article.rating,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      })),
      filters: {
        statuses: statuses.filter(Boolean).sort(),
        categories: categories.filter(Boolean).sort()
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const newArticle = new ArticleModel({
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      type: body.category === 'guides' ? 'guide' : 
            body.category === 'characters' ? 'article' :
            body.category === 'weapons' ? 'article' :
            body.category === 'artifacts' ? 'article' :
            body.category === 'news' ? 'article' :
            body.category === 'review' ? 'article' :
            body.category === 'analysis' ? 'article' : 'article',
      author: body.author,
      category: body.category,
      tags: body.tags || [],
      featuredImage: body.featuredImage,
      status: body.status || 'draft',
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      difficulty: body.difficulty || 'easy',
      estimatedTime: body.estimatedTime || 0,
      prerequisites: body.prerequisites || [],
      relatedArticles: body.relatedArticles || [],
      views: 0,
      rating: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedArticle = await newArticle.save();
    
    return NextResponse.json({
      success: true,
      article: savedArticle
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
} 