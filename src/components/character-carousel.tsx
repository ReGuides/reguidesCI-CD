'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Character } from '@/types';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface CharacterCarouselProps {
  characters: Character[];
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function CharacterCarousel({ 
  characters, 
  className = '', 
  autoPlay = true, 
  autoPlayInterval = 5000 
}: CharacterCarouselProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Удаляем прогресс-логику и анимацию

  // Автовоспроизведение
  useEffect(() => {
    if (!autoPlay || characters.length < 2) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % characters.length);
    }, autoPlayInterval);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, autoPlay, autoPlayInterval, characters.length]);

  const nextCharacter = () => {
    setCurrentIndex((prev) => (prev + 1) % characters.length);
  };

  const prevCharacter = () => {
    setCurrentIndex((prev) => (prev - 1 + characters.length) % characters.length);
  };

  if (!Array.isArray(characters) || characters.length === 0) return null;

  return (
    <div className={`relative group ${className}`}>
      {/* Основная карусель */}
      <div className="relative flex items-center justify-center w-full h-[400px] select-none overflow-visible">
        {/* Navigation Arrows */}
        <button
          onClick={prevCharacter}
          className="absolute left-4 z-40 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-white/20"
          aria-label="Предыдущий персонаж"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextCharacter}
          className="absolute right-4 z-40 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-white/20"
          aria-label="Следующий персонаж"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        {Array.isArray(characters) && characters.map((character, idx) => {
          if (!character || typeof character !== 'object') return null;
          const isActive = idx === currentIndex;
          const isLeft2 = idx === (currentIndex - 2 + characters.length) % characters.length;
          const isLeft1 = idx === (currentIndex - 1 + characters.length) % characters.length;
          const isRight1 = idx === (currentIndex + 1) % characters.length;
          const isRight2 = idx === (currentIndex + 2) % characters.length;
          let scale = 1, opacity = 1, zIndex = 20, translate = 0, mask = '';
          if (isActive) {
            scale = 1;
            opacity = 1;
            zIndex = 20;
            translate = 0;
            mask = '';
          } else if (isLeft1) {
            scale = 0.8;
            opacity = 0.7;
            zIndex = 10;
            translate = -220;
            mask = '';
          } else if (isRight1) {
            scale = 0.8;
            opacity = 0.7;
            zIndex = 10;
            translate = 220;
            mask = '';
          } else if (isLeft2) {
            scale = 0.6;
            opacity = 0.2;
            zIndex = 1;
            translate = -440;
            mask = 'inset(0 40% 0 0)';
          } else if (isRight2) {
            scale = 0.6;
            opacity = 0.2;
            zIndex = 1;
            translate = 440;
            mask = 'inset(0 0 0 40%)';
          } else {
            scale = 0.4;
            opacity = 0;
            zIndex = 0;
            translate = 0;
            mask = '';
          }
          return (
            <div
              key={`carousel-${character.id}`}
              className={`absolute top-0 left-1/2 transition-all duration-700 ease-in-out cursor-pointer rounded-sm shadow-2xl border-2 ${isActive ? 'border-purple-500 shadow-purple-500/50' : 'border-transparent'} hover:z-50`}
              style={{
                width: 320,
                height: 400,
                transform: `translateX(-50%) translateX(${translate}px) scale(${scale})`,
                opacity,
                zIndex,
                WebkitMask: mask ? mask : undefined,
                mask: mask ? mask : undefined,
                pointerEvents: opacity === 0 ? 'none' : 'auto',
              }}
              onClick={() => {
                if (isActive) {
                  router.push(`/characters/${character.id}`);
                } else {
                  setCurrentIndex(idx);
                }
              }}
            >
              <div className="relative w-full h-full rounded-sm overflow-hidden transition-transform duration-300 hover:scale-110">
                {/* Glow effect for active card */}
                {isActive && (
                  <div className="absolute inset-0 rounded-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl scale-100" />
                )}
                <Image
                  src={getImageWithFallback(character.image, character.name, 'character')}
                  alt={character.name}
                  width={320}
                  height={400}
                  className="absolute inset-0 w-full h-full object-cover object-center rounded-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/characters/default.png';
                  }}
                />
                {/* Enhanced gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-sm" />
                {/* Animated border glow */}
                {isActive && (
                  <div className="absolute inset-0 rounded-sm border-2 border-purple-400/50 animate-pulse" />
                )}
                <div className="relative z-10 p-8 flex flex-col gap-4 h-full justify-end">
                  {/* Character name with enhanced styling */}
                  <div className="absolute bottom-12 left-0 w-full px-8">
                    <div className="text-2xl font-bold text-yellow-300 drop-shadow-lg flex items-center gap-3">
                      {character.name}
                      {character.rarity && (
                        <span className="flex items-center gap-0.5 ml-2">
                          {Array.from({ length: Number(character.rarity) }).map((_, i) => (
                            <span key={i} className="text-yellow-300 text-2xl animate-pulse" style={{animationDelay: `${i * 0.1}s`}}>★</span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Hover indicator for active card */}
                  {isActive && (
                    <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Статичный прогресс-бар по индексу */}
      {characters.length > 1 && (
        <div className="mt-8">
          <div className="w-full bg-neutral-700 rounded-full h-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-full"
              style={{
                width: `${((currentIndex + 1) / characters.length) * 100}%`,
                transition: 'none'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 