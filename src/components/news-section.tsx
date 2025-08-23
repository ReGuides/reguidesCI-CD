'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Image from 'next/image';

interface News {
  _id: string;
  title: string;
  content: string;
  image?: string;
  author: string;
  publishedAt: string;
  isPublished: boolean;
  tags: string[];
  type?: 'manual' | 'birthday' | 'update' | 'event';
  characterId?: string;
  views: number;
}

export default function NewsSection() {
  const [news, setNews] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        setNews(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]); // Устанавливаем пустой массив в случае ошибки
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Если новостей нет, не показываем секцию
  if (!loading && (!Array.isArray(news) || news.length === 0)) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto mt-12 sm:mt-16 px-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Новости</h2>
        <div className="flex justify-center">
          <LoadingSpinner size="md" className="text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-12 sm:mt-16 px-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Новости</h2>
      <div className="flex flex-col gap-4">
        {Array.isArray(news) && news.map((item, index) => {
          if (!item || typeof item !== 'object') return null;
          
          return (
                         <button
               key={`news-${item._id || index}`}
               className="bg-neutral-800 rounded-xl p-4 flex items-center gap-4 shadow text-left hover:bg-neutral-700 transition"
               onClick={() => setSelectedNews(item)}
             >
               <div className={`w-2 h-8 rounded ${item.type === 'birthday' ? 'bg-pink-400' : 'bg-blue-400'}`} />
               
               {/* Изображение новости */}
               {item.image && (
                 <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                   <Image 
                     src={item.image} 
                     alt={item.title}
                     width={64}
                     height={64}
                     className="w-full h-full object-cover"
                   />
                 </div>
               )}
               
               <div className="flex-1 min-w-0">
                 <div className="text-sm text-gray-400 mb-1">
                   {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('ru-RU') : 'Дата не указана'}
                 </div>
                 <div className="text-white font-semibold text-base sm:text-lg line-clamp-2">{item.title}</div>
                 <div className="text-gray-300 mt-1 text-sm line-clamp-2">
                   {item.content ? 
                     item.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 
                     'Описание недоступно'
                   }
                 </div>
               </div>
             </button>
          );
        })}
      </div>

      {/* Модальное окно для новости */}
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
              
              {/* Изображение */}
              {selectedNews.image && (
                <div className="my-4">
                  <Image 
                    src={selectedNews.image} 
                    alt={selectedNews.title}
                    width={800}
                    height={400}
                    className="w-full h-auto max-h-96 object-cover rounded-lg shadow-lg"
                    onError={() => {
                      // Next.js Image автоматически обрабатывает ошибки
                    }}
                  />
                </div>
              )}
              
              {/* Разделитель */}
              <hr className="my-2 border-neutral-700" />
              
              {/* Контент */}
              <div 
                className="text-sm sm:text-base text-gray-200 mt-2 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedNews.content || 'Контент недоступен' }}
              />
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
  );
} 