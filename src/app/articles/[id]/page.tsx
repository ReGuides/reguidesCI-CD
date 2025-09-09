'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { News } from '@/types';
import { ArrowLeft, Calendar, Eye, Tag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Image from 'next/image';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);



  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/news/${params.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data.type === 'article') {
        setArticle(data.data);
      } else {
        throw new Error('Статья не найдена');
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'news': return 'text-blue-400';
      case 'guide': return 'text-green-400';
      case 'review': return 'text-yellow-400';
      case 'tutorial': return 'text-purple-400';
      case 'event': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'news': return 'Новости';
      case 'guide': return 'Гайд';
      case 'review': return 'Обзор';
      case 'tutorial': return 'Туториал';
      case 'event': return 'Событие';
      default: return category;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" className="text-accent" />
          <span className="ml-3 text-neutral-400">Загрузка статьи...</span>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-red-400">
          <h2 className="text-2xl font-bold mb-4">Ошибка загрузки</h2>
          <p>{error || 'Статья не найдена'}</p>
          <Button 
            onClick={() => router.push('/articles')}
            className="mt-4"
          >
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Навигация */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/articles')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к списку
        </Button>
      </div>

      {/* Заголовок статьи */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(article.category || 'news')}`}>
            {getCategoryLabel(article.category || 'news')}
          </span>
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ru-RU') : 'Не опубликовано'}
          </span>
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {article.views} просмотров
          </span>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">{article.title}</h1>
        
        {article.excerpt && (
          <p className="text-xl text-gray-300 mb-6">{article.excerpt}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{article.author}</span>
          </div>
          {article.characterId && article.characterName && (
            <span>• Персонаж: {article.characterName}</span>
          )}
        </div>
      </div>

      {/* Изображение */}
      {article.image && (
        <div className="mb-8">
          <Image
            src={article.image}
            alt={article.title}
            width={800}
            height={400}
            className="w-full h-auto rounded-lg"
            priority
          />
        </div>
      )}

      {/* Содержание */}
      <div className="max-w-none">
        <div 
          className="text-gray-300 leading-relaxed news-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {/* Стили для HTML контента */}
        <style jsx global>{`
          .news-content h1 {
            font-size: 1.875rem;
            font-weight: 700;
            color: white;
            margin-bottom: 1rem;
            margin-top: 2rem;
            line-height: 1.2;
          }
          .news-content h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.75rem;
            margin-top: 1.5rem;
            line-height: 1.3;
          }
          .news-content h3 {
            font-size: 1.25rem;
            font-weight: 500;
            color: white;
            margin-bottom: 0.5rem;
            margin-top: 1rem;
            line-height: 1.4;
          }
          .news-content p {
            margin-bottom: 1rem;
            line-height: 1.7;
            color: #d1d5db;
          }
          .news-content ul {
            margin-bottom: 1rem;
            padding-left: 1.5rem;
          }
          .news-content li {
            margin-bottom: 0.5rem;
            color: #d1d5db;
            line-height: 1.6;
          }
          .news-content strong {
            font-weight: 600;
            color: white;
          }
          .news-content em {
            font-style: italic;
            color: #d1d5db;
          }
          .news-content a {
            color: #3b82f6;
            text-decoration: underline;
          }
          .news-content a:hover {
            color: #60a5fa;
          }
          .news-content blockquote {
            border-left: 4px solid #6b7280;
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: #9ca3af;
          }
          .news-content code {
            background-color: #374151;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            color: #f3f4f6;
          }
          .news-content pre {
            background-color: #1f2937;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1rem 0;
          }
          .news-content pre code {
            background-color: transparent;
            padding: 0;
          }
        `}</style>
        
        {/* Стили для интерактивных элементов */}
        <style jsx>{`
          .character-card {
            cursor: pointer;
            transition: all 0.2s ease;
            border-radius: 4px;
            padding: 2px 4px;
          }
          .character-card:hover {
            background-color: rgba(59, 130, 246, 0.2);
            transform: translateY(-1px);
          }
          .artifact-info {
            cursor: pointer;
            transition: all 0.2s ease;
            border-radius: 4px;
            padding: 2px 4px;
          }
          .artifact-info:hover {
            background-color: rgba(34, 197, 94, 0.2);
            transform: translateY(-1px);
          }
          .weapon-info {
            cursor: pointer;
            transition: all 0.2s ease;
            border-radius: 4px;
            padding: 2px 4px;
          }
          .weapon-info:hover {
            background-color: rgba(168, 85, 247, 0.2);
            transform: translateY(-1px);
          }
          .element-badge {
            cursor: pointer;
            transition: all 0.2s ease;
            border-radius: 4px;
            padding: 2px 4px;
          }
          .element-badge:hover {
            background-color: rgba(251, 191, 36, 0.2);
            transform: translateY(-1px);
          }
        `}</style>
      </div>

      {/* Теги */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-neutral-700">
          <h3 className="text-lg font-semibold text-white mb-3">Теги</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-neutral-700 text-gray-300 rounded-full text-sm flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Кнопка возврата */}
      <div className="mt-8 pt-6 border-t border-neutral-700">
        <Button 
          variant="outline" 
          onClick={() => router.push('/articles')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Вернуться к списку
        </Button>
      </div>
    </div>
  );
}
