'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Advertisement } from '@/types';
import Image from 'next/image';


export default function AdvertisementPopup() {
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageError, setImageError] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Определяем тип устройства
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    // Загружаем рекламу
    const fetchPopupAd = async () => {
      try {
        const response = await fetch('/api/advertisements/popup');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const ad = result.data;
            
            // Проверяем, подходит ли реклама для текущего устройства
            if (ad.deviceTargeting === 'all' || 
                (ad.deviceTargeting === 'mobile' && isMobile) ||
                (ad.deviceTargeting === 'desktop' && !isMobile)) {
              setAdvertisement(ad);
              setTimeout(() => {
                setIsVisible(true);
                
                // Отправляем событие показа рекламы
                if (typeof window !== 'undefined' && window.trackAdImpression) {
                  window.trackAdImpression(ad._id, 'popup', 'modal', ad.title || 'Реклама');
                }
              }, 3000);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching popup advertisement:', error);
      }
    };

    fetchPopupAd();

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, [isMobile]);

  // Не показываем рекламу в админке
  if (pathname.startsWith('/admin')) {
    return null;
  }

  if (!advertisement || !isVisible) {
    return null;
  }

  // Функция для получения правильного URL изображения
  const getImageUrl = (imagePath: string | undefined): string | null => {
    if (!imagePath) return null;
    
    // Если это полный URL, возвращаем как есть
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Если это относительный путь, добавляем базовый URL
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // Иначе добавляем базовый путь
    return `/images/advertisement/${imagePath}`;
  };

  const imageUrl = getImageUrl(advertisement.backgroundImage);

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 transition-opacity duration-300"
      onClick={() => setIsVisible(false)} // Закрытие по клику вне модалки
    >
      <div 
        className="bg-neutral-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl relative transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на модалку
      >

        
        {/* Изображение */}
        {imageUrl && !imageError && (
          <div className="relative h-48">
            <Image
              src={imageUrl}
              alt={advertisement.title || 'Advertisement'}
              fill
              className="object-cover"
              onError={() => {
                console.error('Failed to load advertisement image:', imageUrl);
                setImageError(true);
              }}
              onLoad={() => {
                console.log('Advertisement image loaded successfully:', imageUrl);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-800/80 to-transparent" />
          </div>
        )}
        
        {/* Fallback для изображения или если изображение не загрузилось */}
        {(!imageUrl || imageError) && (
          <div className="relative h-48 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">📢</div>
              <div className="text-sm opacity-80">Реклама</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-800/80 to-transparent" />
          </div>
        )}
        
        {/* Контент */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-3">{advertisement.title || 'Реклама'}</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {advertisement.description || 'Описание рекламы'}
            </p>
            
            {/* Отображаем ERID если он указан */}
            {advertisement.erid && (
              <div className="mt-3 p-2 bg-neutral-700/50 rounded-lg border border-neutral-600">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">ERID:</span>
                  <span className="text-xs font-mono text-blue-300 bg-neutral-800 px-2 py-1 rounded">
                    {advertisement.erid}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            {/* Основная кнопка действия */}
            <a
              href={advertisement.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200 text-center shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 border-0 text-base"
              onClick={() => {
                // Отправляем событие клика по рекламе
                if (typeof window !== 'undefined' && window.trackAdClick) {
                  window.trackAdClick(advertisement._id, 'popup', 'modal', advertisement.title || 'Реклама');
                }
              }}
            >
              {advertisement.cta || 'Узнать больше'}
            </a>
            
            {/* Кнопка "Позже" */}
            <button
              onClick={() => setIsVisible(false)}
              className="w-full px-6 py-3 bg-transparent hover:bg-neutral-700 text-gray-400 hover:text-white font-medium rounded-lg transition-colors border border-neutral-600 hover:border-neutral-500 text-sm"
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
