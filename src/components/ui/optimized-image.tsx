'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  type?: 'character' | 'weapon' | 'artifact';
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  fallbackSrc,
  type = 'character',
  onError
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getDefaultFallback = () => {
    switch (type) {
      case 'character':
        return '/images/characters/default.png';
      case 'weapon':
        return '/images/weapons/default.webp';
      case 'artifact':
        return '/images/artifacts/default.webp';
      default:
        return '/images/logos/default.png';
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
    
    // Вызываем пользовательский обработчик ошибки
    if (onError) {
      onError();
    }
  };

  const finalSrc = imageError ? (fallbackSrc || getDefaultFallback()) : (src || getDefaultFallback());

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-700 animate-pulse rounded flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-neutral-400" />
        </div>
      )}
      
      <Image
        src={finalSrc}
        alt={alt}
        width={400}
        height={400}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      {imageError && !isLoading && (
        <div className="absolute inset-0 bg-neutral-700 rounded flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-neutral-400" />
        </div>
      )}
    </div>
  );
} 