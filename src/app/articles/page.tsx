'use client';

import { useState, useEffect, useCallback } from 'react';
import { IArticle } from '@/lib/db/models/Article';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface ArticleFilters {
  type?: string;
  category?: string;
  difficulty?: string;
  tags?: string[];
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'rating';
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ArticleFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false
  });

  const loadArticles = useCallback(async (page = 1, searchFilters?: ArticleFilters) => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = searchFilters || filters;
      const params = new URLSearchParams();
      
      if (page > 1) params.append('page', page.toString());
      if (currentFilters.type && currentFilters.type !== 'all') params.append('type', currentFilters.type);
      if (currentFilters.category && currentFilters.category !== 'all') params.append('category', currentFilters.category);
      if (currentFilters.difficulty && currentFilters.difficulty !== 'all') params.append('difficulty', currentFilters.difficulty);
      if (currentFilters.tags && currentFilters.tags.length > 0) params.append('tags', currentFilters.tags.join(','));
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.sortBy) params.append('sortBy', currentFilters.sortBy);

      const response = await fetch(`/api/articles?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setArticles(data.articles || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        pages: 1,
        hasNext: false,
        hasPrev: false
      });
    } catch (err) {
      console.error('Error loading articles:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadArticles(1, filters);
  }, [filters, loadArticles]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const newFilters = { ...filters, search: query };
      setFilters(newFilters);
    } else {
      const newFilters = { ...filters };
      delete newFilters.search;
      setFilters(newFilters);
    }
  }, [filters]);

  const handleFilterChange = useCallback((newFilters: Partial<ArticleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    loadArticles(page, filters);
  }, [loadArticles, filters]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setError(null);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guide': return 'text-blue-400';
      case 'article': return 'text-purple-400';
      case 'quest': return 'text-green-400';
      case 'tutorial': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  if (loading && articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" className="text-accent" />
          <span className="ml-3 text-neutral-400">Загрузка статей...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      <aside className="w-full md:w-64 flex-shrink-0">
        {/* Поиск и фильтры */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск статей..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <select
            value={filters.type || 'all'}
            onChange={(e) => handleFilterChange({ type: e.target.value })}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-accent"
          >
            <option value="all">Все типы</option>
            <option value="guide">Гайды</option>
            <option value="article">Статьи</option>
            <option value="quest">Квесты</option>
            <option value="tutorial">Туториалы</option>
          </select>
          <select
            value={filters.difficulty || 'all'}
            onChange={(e) => handleFilterChange({ difficulty: e.target.value })}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-accent"
          >
            <option value="all">Любая сложность</option>
            <option value="easy">Легкая</option>
            <option value="medium">Средняя</option>
            <option value="hard">Сложная</option>
          </select>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value as 'newest' | 'oldest' | 'popular' | 'rating' })}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-accent"
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="popular">По популярности</option>
            <option value="rating">По рейтингу</option>
          </select>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
          >
            Очистить фильтры
          </button>
        </div>
      </aside>
      <main className="flex-1">
        {/* Статистика */}
        {!searchQuery && (
          <div className="mb-6 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
            <div className="text-sm text-text-secondary">
              <div className="font-medium mb-1">Статистика</div>
              <div>Найдено: {pagination.total}</div>
              {pagination.pages > 1 && <div>Страниц: {pagination.pages}</div>}
            </div>
          </div>
        )}
        {/* Error State */}
        {error && (
          <div className="text-center text-red-400 mb-6">
            <h2 className="text-2xl font-bold mb-4">Ошибка загрузки</h2>
            <p>{error}</p>
          </div>
        )}
        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {articles.map((article) => (
            <Link 
              key={String(article._id)} 
              href={`/articles/${article.slug}`}
              className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 hover:bg-neutral-750 transition-colors block"
            >
              {article.featuredImage && (
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(article.type)}`}>
                  {article.type === 'guide' && 'Гайд'}
                  {article.type === 'article' && 'Статья'}
                  {article.type === 'quest' && 'Квест'}
                  {article.type === 'tutorial' && 'Туториал'}
                </span>
                {article.difficulty && (
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(article.difficulty)}`}>
                    {article.difficulty === 'easy' && 'Легкая'}
                    {article.difficulty === 'medium' && 'Средняя'}
                    {article.difficulty === 'hard' && 'Сложная'}
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {article.views} просмотров
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{article.title}</h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {article.author.avatar && (
                    <img
                      src={article.author.avatar}
                      alt={article.author.name || article.author.username}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-sm text-gray-400">
                    {article.author.name || article.author.username}
                  </span>
                </div>
                {article.publishedAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString('ru-RU')}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
        {/* No Results */}
        {!loading && !error && articles.length === 0 && (
          <div className="text-center text-text-secondary">
            <p>Статьи не найдены</p>
          </div>
        )}
        {/* Pagination */}
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Назад
          </button>
          <span className="px-4 py-2 text-white">
            {pagination.page} из {pagination.pages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Вперед
          </button>
        </div>
      </main>
    </div>
  );
} 