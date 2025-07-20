'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Users, Sword, Gem, FileText, Settings } from 'lucide-react';

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { href: '/characters', icon: Users, label: 'Персонажи' },
    { href: '/weapons', icon: Sword, label: 'Оружия' },
    { href: '/artifacts', icon: Gem, label: 'Артефакты' },
    { href: '/articles', icon: FileText, label: 'Статьи' },
    { href: '/admin', icon: Settings, label: 'Админ' },
  ];

  return (
    <div className="lg:hidden">
      {/* Кнопка меню */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-accent text-white p-3 rounded-full shadow-lg hover:bg-accent/90 transition-colors"
        aria-label="Открыть меню"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Мобильное меню */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)}>
          <div 
            className="absolute bottom-20 right-4 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-neutral-700 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 