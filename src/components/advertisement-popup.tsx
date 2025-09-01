'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Advertisement } from '@/types';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function AdvertisementPopup() {
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
                
                // Отслеживаем показ рекламы
                if (ad._id && typeof window !== 'undefined' && (window as any).trackAdImpression) {
                  (window as any).trackAdImpression(ad._id, 'popup', 'modal', ad.title);
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-neutral-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl relative">
        {/* Кнопка закрытия - перемещена в правый верхний угол изображения */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
          aria-label="Закрыть рекламу"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Изображение */}
        {advertisement.backgroundImage && (
          <div className="relative h-48">
            <Image
              src={advertisement.backgroundImage}
              alt={advertisement.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-800/80 to-transparent" />
          </div>
        )}
        
        {/* Контент */}
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-2">{advertisement.title}</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {advertisement.description}
            </p>
          </div>
          
          <div className="flex gap-3">
            <a
              href={advertisement.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all duration-200 text-center shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
              onClick={() => {
                // Отслеживаем клик по рекламе
                if (typeof window !== 'undefined' && (window as any).trackAdClick) {
                  (window as any).trackAdClick(advertisement._id, 'popup', 'modal', advertisement.title);
                }
              }}
            >
              {advertisement.cta}
            </a>
            <button
              onClick={() => setIsVisible(false)}
              className="px-6 py-4 bg-neutral-700 hover:bg-neutral-600 text-gray-300 hover:text-white font-medium rounded-lg transition-colors border border-neutral-600 hover:border-neutral-500"
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
