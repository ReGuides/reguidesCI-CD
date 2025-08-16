'use client';

import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { settings, refreshSettings } = useSiteSettings();
  const router = useRouter();

  // Debug logging
  console.log('Header render - settings:', settings);
  console.log('Header render - logoUrl:', settings?.logo);

  // Обновляем настройки каждые 30 секунд для синхронизации
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Header: Refreshing settings...');
      refreshSettings();
    }, 30000); // 30 секунд

    return () => clearInterval(interval);
  }, [refreshSettings]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Fallback значения на случай ошибки загрузки настроек
  const siteName = settings?.siteName || 'ReGuides';
  const logoUrl = settings?.logo || '/images/logos/logo.png';
  
  console.log('Header: Final logoUrl:', logoUrl);

  return (
    <header className="bg-header text-text shadow-lg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <nav className="flex items-center justify-between min-w-0">
          {/* Логотип и название сайта слева */}
          <div className="flex-shrink-0 relative z-10">
            <Link 
              href="/" 
              className="flex items-center space-x-2 sm:space-x-3 group relative z-10"
              onClick={(e) => {
                console.log('Header: Logo/Title clicked, navigating to /');
                // Fallback: если Link не работает, используем router
                e.preventDefault();
                router.push('/');
              }}
            >
              {/* Логотип сайта */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 pointer-events-none">
                <Image 
                  src={logoUrl} 
                  alt="Site Logo" 
                  width={40}
                  height={40}
                  className="w-full h-full object-contain cursor-pointer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/logos/logo.png';
                  }}
                />
              </div>
              
              {/* Название сайта и игры */}
              <div className="flex flex-col min-w-0 cursor-pointer pointer-events-none">
                <span className="text-lg sm:text-2xl font-bold text-accent group-hover:text-accent-dark transition-colors truncate">
                  {siteName}
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