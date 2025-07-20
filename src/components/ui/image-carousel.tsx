'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Pause } from 'lucide-react';
import Image from 'next/image';

interface ImageCarouselProps {
  images: Array<{ src: string; alt: string }>;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function ImageCarousel({ 
  images, 
  className = '', 
  autoPlay = false, 
  autoPlayInterval = 5000 
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  // Автовоспроизведение
  useEffect(() => {
    if (!autoPlay || !isPlaying || isHovered || isFullscreen) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, isPlaying, isHovered, isFullscreen, autoPlayInterval, images.length]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <>
      {/* Основная карусель */}
      <div 
        className={`relative group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Основное изображение */}
        <div className="relative overflow-hidden rounded-lg">
          <Image
            src={currentImage.src}
            alt={currentImage.alt}
            width={400}
            height={256}
            className="w-full h-64 object-cover cursor-pointer transition-transform hover:scale-105"
            onClick={openFullscreen}
            onError={(e) => {
              e.currentTarget.src = '/images/placeholder.png';
            }}
          />
          
          {/* Overlay с информацией */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="text-sm font-medium">{currentImage.alt}</p>
              <p className="text-xs text-neutral-300">
                {currentIndex + 1} из {images.length}
              </p>
            </div>
          </div>

          {/* Кнопки навигации */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/70 hover:scale-110"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/70 hover:scale-110"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Кнопка автовоспроизведения */}
          {autoPlay && images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/70 hover:scale-110"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Улучшенные индикаторы */}
        {images.length > 1 && (
          <div className="mt-4 space-y-3">
            {/* Прогресс-бар */}
            <div className="w-full bg-neutral-200 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-accent h-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${((currentIndex + 1) / images.length) * 100}%`,
                  transform: isPlaying ? 'scaleX(1)' : 'scaleX(0.95)'
                }}
              />
            </div>

            {/* Точки-индикаторы */}
            <div className="flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className="group relative"
                >
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-accent scale-125' 
                      : 'bg-neutral-400 hover:bg-neutral-300 hover:scale-110'
                  }`} />
                  
                  {/* Анимированная обводка для активной точки */}
                  {index === currentIndex && (
                    <div className="absolute inset-0 rounded-full border-2 border-accent animate-pulse" />
                  )}
                  
                  {/* Подсказка при наведении */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>

            {/* Счетчик */}
            <div className="text-center text-sm text-neutral-600">
              {currentIndex + 1} из {images.length}
            </div>
          </div>
        )}

        {/* Миниатюры с улучшенным дизайном */}
        {images.length > 1 && (
          <div className="mt-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-neutral-100">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 relative group/thumb transition-all duration-200 ${
                    index === currentIndex 
                      ? 'ring-2 ring-accent ring-offset-2' 
                      : 'hover:ring-2 hover:ring-neutral-400 hover:ring-offset-2'
                  }`}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.png';
                      }}
                    />
                  </div>
                  
                  {/* Индикатор загрузки */}
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-accent/20 rounded-lg" />
                  )}
                  
                  {/* Номер миниатюры */}
                  <div className="absolute top-1 right-1 w-4 h-4 bg-black/70 text-white text-xs rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Полноэкранный режим */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Основное изображение */}
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder.png';
              }}
            />

            {/* Кнопка закрытия */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all duration-200 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Навигация */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Улучшенный индикатор */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                  <div className="bg-black/70 backdrop-blur-sm text-white px-6 py-3 rounded-full flex items-center gap-4">
                    <div className="flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            index === currentIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/50 hover:bg-white/75 hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {currentIndex + 1} из {images.length}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Информация об изображении */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
              <p className="text-sm">{currentImage.alt}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 