'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';
import { News } from '@/types';
import Image from 'next/image';
import { getNewsImage, getNewsImageAlt } from '@/lib/utils/newsImageUtils';

export default function SidebarWrapper() {
  const pathname = usePathname();
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  
  return (
    <>
      {/* Сайдбар - скрыт в админке */}
      {!pathname?.startsWith('/admin') && (
        <div className="hidden lg:block w-72 flex-shrink-0 p-4 overflow-hidden">
          <Sidebar onNewsSelect={setSelectedNews} />
        </div>
      )}
      
      {/* Модальное окно для новостей - полноэкранное */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-neutral-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Дата и автор */}
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>{selectedNews.publishedAt ? new Date(selectedNews.publishedAt).toLocaleDateString('ru-RU') : 'Дата не указана'}</span>
                {selectedNews.author && (
                  <span>
                    Автор: <span className="font-semibold text-white">{selectedNews.author}</span>
                  </span>
                )}
              </div>
              
              {/* Заголовок */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white pr-4">{selectedNews.title}</h2>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="text-gray-400 hover:text-white text-2xl flex-shrink-0"
                >
                  ×
                </button>
              </div>
              
              {/* Изображение */}
              {(() => {
                const imageUrl = getNewsImage(selectedNews.image, selectedNews.characterId, selectedNews.characterName);
                if (!imageUrl) return null;
                
                return (
                  <div className="mb-4">
                    <Image 
                      src={imageUrl} 
                      alt={getNewsImageAlt(selectedNews.title, selectedNews.characterName)}
                      width={800}
                      height={400}
                      className="w-full h-auto max-h-96 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                );
              })()}
              
              {/* Разделитель */}
              <hr className="my-4 border-neutral-700" />
              
              {/* Контент */}
              <div 
                className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedNews.content }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 