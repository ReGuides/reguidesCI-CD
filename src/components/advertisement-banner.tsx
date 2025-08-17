'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Advertisement } from '@/types';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function AdvertisementBanner() {
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Не показываем рекламу в админке
  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    // Определяем тип устройства
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    // Загружаем рекламу
    const fetchBannerAd = async () => {
      try {
        const response = await fetch('/api/advertisements/banner');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const ad = result.data;
            
            // Проверяем, подходит ли реклама для текущего устройства
            if (ad.deviceTargeting === 'all' || 
                (ad.deviceTargeting === 'mobile' && isMobile) ||
                (ad.deviceTargeting === 'desktop' && !isMobile)) {
              setAdvertisement(ad);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching banner advertisement:', error);
      }
    };

    fetchBannerAd();

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, [isMobile]);

  if (!advertisement || !isVisible) {
    return null;
  }

  return (
    <div className="w-full bg-neutral-900 border-b border-neutral-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {advertisement.backgroundImage && (
              <div className="flex-shrink-0">
                <Image
                  src={advertisement.backgroundImage}
                  alt={advertisement.title}
                  width={40}
                  height={40}
                  className="rounded object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm leading-tight mb-1">
                {advertisement.title}
              </h4>
              <p className="text-gray-300 text-xs leading-tight line-clamp-2">
                {advertisement.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href={advertisement.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xs font-bold rounded transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-purple-500/25"
            >
              {advertisement.cta}
            </a>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
              aria-label="Закрыть рекламу"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
