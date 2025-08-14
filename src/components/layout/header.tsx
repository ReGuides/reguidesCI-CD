'use client';

import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-header text-text shadow-lg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <nav className="flex items-center justify-between min-w-0">
          {/* Логотип и название сайта слева */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
              {/* Логотип Genshin Impact */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                <Image 
                  src="/images/logos/logo.png" 
                  alt="Genshin Impact Logo" 
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Название сайта и игры */}
              <div className="flex flex-col min-w-0">
                <span className="text-lg sm:text-2xl font-bold text-accent group-hover:text-accent-dark transition-colors truncate">
                  ReGuides
                </span>
                <span className="text-xs sm:text-sm text-text-secondary font-medium truncate">
                  Genshin Impact
                </span>
              </div>
            </Link>
          </div>
          
          {/* Поиск по центру */}
          <div className="hidden md:flex flex-1 justify-center px-8 min-w-0">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Поиск персонажей, оружия, артефактов..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Мобильное меню */}
          <button 
            className="md:hidden p-2 hover:bg-neutral-700 rounded-lg transition-colors flex-shrink-0"
            onClick={toggleMenu}
            aria-label="Открыть меню"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-neutral-400" />
            ) : (
              <Menu className="w-6 h-6 text-neutral-400" />
            )}
          </button>

          {/* Десктопное меню справа */}
          <div className="hidden md:flex space-x-6 items-center flex-shrink-0">
            <Link href="/characters" className="text-text hover:text-highlight transition-colors whitespace-nowrap">
              Персонажи
            </Link>
            <Link href="/weapons" className="text-text hover:text-highlight transition-colors whitespace-nowrap">
              Оружие
            </Link>
            <Link href="/artifacts" className="text-text hover:text-highlight transition-colors whitespace-nowrap">
              Артефакты
            </Link>
            {/* Ссылка на статьи временно скрыта */}
            <Link href="/about" className="text-text hover:text-highlight transition-colors whitespace-nowrap">
              О проекте
            </Link>
          </div>
        </nav>

        {/* Мобильное меню (выпадающее) */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4 animate-fade-in">
            {/* Мобильный поиск */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск персонажей, оружия, артефактов..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            
            {/* Навигационные ссылки */}
            <div className="space-y-2">
              <Link 
                href="/characters" 
                className="block px-4 py-3 text-text hover:text-highlight hover:bg-neutral-700 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Персонажи
              </Link>
              <Link 
                href="/weapons" 
                className="block px-4 py-3 text-text hover:text-highlight hover:bg-neutral-700 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Оружие
              </Link>
              <Link 
                href="/artifacts" 
                className="block px-4 py-3 text-text hover:text-highlight hover:bg-neutral-700 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Артефакты
              </Link>
              {/* Ссылка на статьи временно скрыта */}
              <Link 
                href="/about" 
                className="block px-4 py-3 text-text hover:text-highlight hover:bg-neutral-700 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                О проекте
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 