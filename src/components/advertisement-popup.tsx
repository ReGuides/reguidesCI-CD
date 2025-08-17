'use client';

import { useState, useEffect } from 'react';
import { Advertisement } from '@/types';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function AdvertisementPopup() {
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Определяем тип устройства
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    // Загружаем рекламу и показываем через 3 секунды
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
              
              // Показываем рекламу через 3 секунды
              setTimeout(() => {
                setIsVisible(true);
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

  if (!advertisement || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-neutral-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
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
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-white">{advertisement.title}</h2>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Закрыть рекламу"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            {advertisement.description}
          </p>
          
          <div className="flex gap-3">
            <a
              href={advertisement.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-center"
            >
              {advertisement.cta}
            </a>
            <button
              onClick={() => setIsVisible(false)}
              className="px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-gray-300 font-medium rounded-lg transition-colors"
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
