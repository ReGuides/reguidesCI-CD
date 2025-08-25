'use client';

import { useState, useEffect, useCallback } from 'react';
import { News } from '@/types';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Calendar, Eye, Tag, User, X } from 'lucide-react';
import Image from 'next/image';
import { getNewsImage, getNewsImageAlt } from '@/lib/utils/newsImageUtils';

interface NewsFilters {
  type?: string;
  category?: string;
  tags?: string[];
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'popular';
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
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NewsFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false
  });

  const loadNews = useCallback(async (page = 1, searchFilters?: NewsFilters) => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = searchFilters || filters;
      const params = new URLSearchParams();
      
      if (page > 1) params.append('page', page.toString());
      if (currentFilters.type && currentFilters.type !== 'all') params.append('type', currentFilters.type);
      if (currentFilters.category && currentFilters.category !== 'all') params.append('category', currentFilters.category);
      if (currentFilters.tags && currentFilters.tags.length > 0) params.append('tags', currentFilters.tags.join(','));
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.sortBy) params.append('sortBy', currentFilters.sortBy);

      const response = await fetch(`/api/news?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setNews(data.data || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        pages: 1,
        hasNext: false,
        hasPrev: false
      });
    } catch (err) {
      console.error('Error loading news:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadNews(1, filters);
  }, [filters, loadNews]);

  // Обработчик кликов на персонажей в контенте
  useEffect(() => {
    const handleGameElementClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const gameElement = target.closest('[data-modal-type]') as HTMLElement;
      
      if (gameElement) {
        const modalType = gameElement.dataset.modalType;
        const modalId = gameElement.dataset.modalId;
        
        if (modalType && modalId) {
          console.log(`Opening modal for ${modalType} with id: ${modalId}`);
          window.dispatchEvent(new CustomEvent('openModal', { 
            detail: { type: modalType, id: modalId } 
          }));
        }
      }
    };
    
    document.addEventListener('click', handleGameElementClick);
    return () => {
      document.removeEventListener('click', handleGameElementClick);
    };
  }, []);

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

  const handleFilterChange = useCallback((newFilters: Partial<NewsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    loadNews(page, filters);
  }, [loadNews, filters]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setError(null);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manual': return 'text-blue-400';
      case 'birthday': return 'text-pink-400';
      case 'update': return 'text-green-400';
      case 'event': return 'text-purple-400';
      case 'article': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'manual': return 'Новость';
      case 'birthday': return 'День рождения';
      case 'update': return 'Обновление';
      case 'event': return 'Событие';
      case 'article': return 'Статья';
      default: return type;
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

  if (loading && news.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" className="text-accent" />
          <span className="ml-3 text-neutral-400">Загрузка новостей и статей...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Заголовок страницы */}
             <div className="mb-8">
         <h1 className="text-4xl font-bold text-white mb-4">Новости и статьи</h1>
         <p className="text-gray-300 text-lg">
           Здесь вы найдете все последние новости, обновления и подробные статьи о мире игры. 
           <span className="text-orange-400 font-medium">Статьи</span> выделены оранжевым цветом и содержат подробную информацию.
         </p>
       </div>
      
      <div className="flex flex-col md:flex-row gap-6">
      <aside className="w-full md:w-64 flex-shrink-0">
        {/* Поиск и фильтры */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск новостей и статей..."
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
            <option value="manual">Новости</option>
            <option value="birthday">Дни рождения</option>
            <option value="update">Обновления</option>
            <option value="event">События</option>
            <option value="article">Статьи</option>
          </select>
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleFilterChange({ category: e.target.value })}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-accent"
          >
            <option value="all">Все категории</option>
            <option value="news">Новости</option>
            <option value="guide">Гайды</option>
            <option value="review">Обзоры</option>
            <option value="tutorial">Туториалы</option>
            <option value="event">События</option>
          </select>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value as 'newest' | 'oldest' | 'popular' })}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-accent"
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="popular">По популярности</option>
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
        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {news.map((item) => (
                         <div 
               key={item._id} 
               className={`rounded-lg p-6 transition-all duration-200 cursor-pointer ${
                 item.type === 'article' 
                   ? 'bg-gradient-to-br from-orange-900/20 to-orange-800/30 border border-orange-700/50 hover:from-orange-900/30 hover:to-orange-800/40 hover:border-orange-600/70 hover:shadow-lg hover:shadow-orange-500/10' 
                   : 'bg-neutral-800 border border-neutral-700 hover:bg-neutral-750'
               }`}
               onClick={() => {
                 // Все элементы открываются в модальном окне
                 setSelectedNews(item);
               }}
             >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
                             <div className="flex items-center gap-2 mb-3">
                 <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(item.type)}`}>
                   {getTypeLabel(item.type)}
                 </span>
                 {item.type === 'article' && item.category && (
                   <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(item.category)}`}>
                     {getCategoryLabel(item.category)}
                   </span>
                 )}
                 {item.type === 'article' && (
                   <span className="ml-auto text-orange-400">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                     </svg>
                   </span>
                 )}
                <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {item.views}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
              {item.type === 'article' && item.excerpt ? (
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">{item.excerpt}</p>
              ) : (
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {item.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {item.author}
                  </span>
                </div>
                {item.publishedAt && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.publishedAt).toLocaleDateString('ru-RU')}
                  </span>
                )}
              </div>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-xs text-gray-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
                  )}
                </div>
              )}
              
              
            </div>
          ))}
        </div>
        {/* No Results */}
        {!loading && !error && news.length === 0 && (
          <div className="text-center text-text-secondary">
            <p>Новости и статьи не найдены</p>
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
      
      {/* Модальное окно для новостей */}
      {selectedNews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedNews(null);
          }}
        >
          <div className="relative bg-neutral-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-700">
            {/* Основной контент */}
            <div className="p-4 sm:p-6">
              {/* Дата и автор */}
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>{selectedNews.publishedAt ? new Date(selectedNews.publishedAt).toLocaleDateString('ru-RU') : 'Дата не указана'}</span>
                {selectedNews.author && (
                  <span>
                    Автор: <span className="font-semibold text-white">{selectedNews.author}</span>
                  </span>
                )}
              </div>
              
              {/* Заголовок */}
              <div className="text-xl sm:text-2xl font-bold text-white mb-1 leading-tight">
                {selectedNews.title}
              </div>
              
              {/* Контент и изображение в две колонки */}
              <div className="flex flex-col lg:flex-row gap-6 mt-4">
                {/* Основной контент */}
                <div className="flex-1 min-w-0 order-2 lg:order-1">
                  {/* Разделитель */}
                  <hr className="mb-4 border-neutral-700" />
                  
                  {/* Контент */}
                  <div 
                    className="text-sm sm:text-base news-content"
                    dangerouslySetInnerHTML={{ __html: selectedNews.content || 'Контент недоступен' }}
                  />
                  
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
                
                {/* Изображение справа (сверху на мобильных) */}
                {(() => {
                  const imageUrl = getNewsImage(selectedNews.image, selectedNews.characterId, selectedNews.characterName);
                  if (!imageUrl) return null;
                  
                  return (
                    <div className="flex-shrink-0 w-full lg:w-80 order-1 lg:order-2">
                      <Image 
                        src={imageUrl} 
                        alt={getNewsImageAlt(selectedNews.title, selectedNews.characterName)}
                        width={320}
                        height={400}
                        className="w-full h-auto max-h-96 object-cover rounded-lg shadow-lg"
                        onError={() => {
                          // Next.js Image автоматически обрабатывает ошибки
                        }}
                      />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Кнопка закрытия */}
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 