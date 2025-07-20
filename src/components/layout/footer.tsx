import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-header text-text border-t border-neutral-800 mt-8 lg:mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Логотип, название и копирайт */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center space-x-2 lg:space-x-3 group">
            {/* Логотип Genshin Impact */}
            <div className="w-6 h-6 lg:w-8 lg:h-8 flex-shrink-0">
              <img 
                src="/images/logos/logo.png" 
                alt="Genshin Impact Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Название сайта и игры */}
            <div className="flex flex-col">
              <span className="text-lg lg:text-xl font-bold text-accent group-hover:text-accent-dark transition-colors">
                ReGuides
              </span>
              <span className="text-xs lg:text-xs text-text-secondary font-medium">
                Genshin Impact
              </span>
            </div>
          </Link>
          <span className="text-xs lg:text-sm text-neutral-400 ml-2">© {new Date().getFullYear()} ReGuides</span>
        </div>
        
        {/* Ссылки */}
        <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 text-sm lg:text-base">
          <Link 
            href="/about" 
            className="text-neutral-400 hover:text-white transition-colors"
          >
            О проекте
          </Link>
          <Link 
            href="/policy" 
            className="text-neutral-400 hover:text-white transition-colors"
          >
            Политика конфиденциальности
          </Link>
          <button className="text-neutral-400 hover:text-white transition-colors">
            Контакты
          </button>
        </div>
      </div>
    </footer>
  );
} 