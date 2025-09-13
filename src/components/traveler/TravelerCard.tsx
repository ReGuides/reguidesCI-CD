'use client';

import React from 'react';
import Link from 'next/link';

export default function TravelerCard() {
  return (
    <Link href="/characters/traveler" className="group">
      <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-lg p-4 border border-neutral-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
        {/* Специальный бейдж для главного персонажа */}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          ГГ
        </div>
        
        {/* Изображение */}
        <div className="aspect-[5/7] mb-3 relative overflow-hidden rounded-lg">
          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <div className="text-6xl">🌟</div>
          </div>
          {/* Элементы вокруг */}
          <div className="absolute top-2 left-2 text-lg">💨</div>
          <div className="absolute top-2 right-2 text-lg">🪨</div>
          <div className="absolute bottom-2 left-2 text-lg">⚡</div>
          <div className="absolute bottom-2 right-2 text-lg">🌱</div>
        </div>
        
        {/* Информация */}
        <div className="space-y-2">
          <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
            Путешественник
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="px-2 py-1 bg-neutral-700 rounded text-xs">Все элементы</span>
            <span className="px-2 py-1 bg-neutral-700 rounded text-xs">Меч</span>
          </div>
          <div className="flex items-center gap-1">
            {[5, 5, 5, 5, 5].map((_, i) => (
              <span key={i} className="text-yellow-400 text-sm">⭐</span>
            ))}
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">
            Главный персонаж, который может использовать все элементы
          </p>
        </div>
        
        {/* Эффект при наведении */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 rounded-lg"></div>
      </div>
    </Link>
  );
}
