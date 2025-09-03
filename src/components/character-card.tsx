'use client';

import { Character } from '@/types';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import Link from 'next/link';
import Image from 'next/image';

// Функция для определения цвета фона в зависимости от элемента
const getElementColor = (element?: string) => {
  switch (element) {
    case 'Пиро': return 'bg-red-600/30';
    case 'Гидро': return 'bg-blue-600/30';
    case 'Электро': return 'bg-purple-600/30';
    case 'Крио': return 'bg-cyan-600/30';
    case 'Дендро': return 'bg-green-600/30';
    case 'Анемо': return 'bg-teal-600/30';
    case 'Гео': return 'bg-yellow-600/30';
    default: return 'bg-black/30';
  }
};

interface CharacterCardProps {
  character: Character;
  className?: string;
}

export function CharacterCard({ character, className = '' }: CharacterCardProps) {
  const imageUrl = character.image || '';

  return (
    <Link href={`/characters/${character.id}`}>
      <div className={`relative bg-card rounded-lg shadow-lg overflow-hidden flex flex-col w-full aspect-[5/7] group ${className}`}>
        <Image
          src={getImageWithFallback(imageUrl, character.name, 'character')}
          alt={character.name}
          width={300}
          height={420}
          className="absolute inset-0 w-full h-full object-cover z-10"
          onError={e => { 
            const target = e.target as HTMLImageElement;
            target.style.opacity = '0.2'; 
          }}
        />
        <div className={`relative z-30 mt-auto w-full p-3 sm:p-4 ${getElementColor(character.element)} backdrop-blur-sm transition-all duration-500 group-hover:mt-0 group-hover:h-full group-hover:flex group-hover:items-center group-hover:justify-center`}>
          <div className="transition-transform duration-500 text-center">
            <h2 className="text-sm sm:text-base font-bold text-white drop-shadow mb-1 group-hover:text-base sm:group-hover:text-xl group-hover:font-extrabold leading-tight min-h-[2.5rem] flex items-center justify-center">
              {character.name}
            </h2>
            <div className="text-xs sm:text-sm text-white drop-shadow mb-1 group-hover:text-sm sm:group-hover:text-base">
              {character.element}
            </div>
            <div className={`text-sm sm:text-base ${character.rarity === 5 ? 'text-yellow-300' : 'text-purple-300'} drop-shadow-lg group-hover:text-base sm:group-hover:text-lg`}>
              {character.rarity ? '★'.repeat(character.rarity) : ''}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 