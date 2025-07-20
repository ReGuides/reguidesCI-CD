'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { IArticle } from '@/lib/db/models/Article';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { ArrowLeft, Eye, Clock, Calendar, User } from 'lucide-react';
import MarkdownRenderer from '@/components/ui/markdown-renderer';

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = use(params);
  const [article, setArticle] = useState<IArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Статья не найдена');
          }
          throw new Error('Ошибка загрузки статьи');
        }
        
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        console.error('Error loading article:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'hard': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guide': return 'text-blue-400 bg-blue-900/20';
      case 'article': return 'text-purple-400 bg-purple-900/20';
      case 'quest': return 'text-green-400 bg-green-900/20';
      case 'tutorial': return 'text-orange-400 bg-orange-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-accent" />
        <span className="ml-3 text-neutral-400">Загрузка статьи...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Ошибка загрузки</h1>
          <p className="text-neutral-400 mb-4">{error}</p>
          <Link 
            href="/articles"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться к статьям
          </Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-white mb-2">Статья не найдена</h1>
          <p className="text-neutral-400 mb-4">Запрашиваемая статья не существует</p>
          <Link 
            href="/articles"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться к статьям
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Навигация назад */}
        <div className="mb-6">
          <Link 
            href="/articles"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться к статьям
          </Link>
        </div>

        {/* Заголовок статьи */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTypeColor(article.type)}`}>
              {article.type === 'guide' && 'Гайд'}
              {article.type === 'article' && 'Статья'}
              {article.type === 'quest' && 'Квест'}
              {article.type === 'tutorial' && 'Туториал'}
            </span>
            {article.difficulty && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(article.difficulty)}`}>
                {article.difficulty === 'easy' && 'Легкая'}
                {article.difficulty === 'medium' && 'Средняя'}
                {article.difficulty === 'hard' && 'Сложная'}
              </span>
            )}
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">{article.title}</h1>
          
          {article.excerpt && (
            <p className="text-xl text-neutral-300 mb-6">{article.excerpt}</p>
          )}

          {/* Метаинформация */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-400 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.author.name || article.author.username}</span>
            </div>
            
            {article.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.publishedAt).toLocaleDateString('ru-RU')}</span>
              </div>
            )}
            
            {article.estimatedTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.estimatedTime} мин</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{article.views} просмотров</span>
            </div>
          </div>
        </div>

        {/* Изображение статьи */}
        {article.featuredImage && (
          <div className="mb-8">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Предварительные требования */}
        {article.prerequisites && article.prerequisites.length > 0 && (
          <div className="mb-8 p-6 bg-neutral-800 border border-neutral-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Предварительные требования</h3>
            <ul className="space-y-2">
              {article.prerequisites.map((prerequisite, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span className="text-neutral-300">{prerequisite}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Содержание статьи */}
        <div className="mb-8">
          <MarkdownRenderer content={article.content} />
        </div>

        {/* Теги */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-neutral-700">
            <h3 className="text-lg font-semibold text-white mb-3">Теги</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-neutral-700 text-neutral-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Связанные статьи */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <div className="mt-8 pt-8 border-t border-neutral-700">
            <h3 className="text-lg font-semibold text-white mb-4">Связанные статьи</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.relatedArticles.map((relatedSlug, index) => (
                <div key={index} className="p-4 bg-neutral-800 border border-neutral-700 rounded-lg">
                  <Link 
                    href={`/articles/${relatedSlug}`}
                    className="text-accent hover:text-accent-dark transition-colors"
                  >
                    {relatedSlug}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 