'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';
import { News } from '@/types';

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
          <div className="bg-neutral-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">{selectedNews.title}</h2>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <div 
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selectedNews.content }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 