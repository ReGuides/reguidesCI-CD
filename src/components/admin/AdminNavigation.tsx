'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Target, 
  FileText, 
  Settings, 
  Megaphone, 
  BarChart3,
  LogsIcon,
  FolderOpen
} from 'lucide-react';

interface NavigationStats {
  characters: number;
  weapons: number;
  artifacts: number;
  news: number;
  users: number;
  advertisements: number;
}

interface AdminNavigationProps {
  className?: string;
}

export default function AdminNavigation({ className = '' }: AdminNavigationProps) {
  const pathname = usePathname();
  const [navigationStats, setNavigationStats] = useState<NavigationStats>({
    characters: 0,
    weapons: 0,
    artifacts: 0,
    news: 0,
    users: 0,
    advertisements: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNavigationStats = async () => {
      try {
        const response = await fetch('/api/admin/navigation-stats');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setNavigationStats(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch navigation stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNavigationStats();
  }, []);

  const navigationItems = [
    {
      href: '/admin',
      label: 'Дашборд',
      icon: Home,
      exact: true
    },
    {
      href: '/admin/analytics',
      label: 'Аналитика',
      icon: BarChart3
    },
    {
      href: '/admin/characters',
      label: 'Персонажи',
      icon: Users
    },
    {
      href: '/admin/weapons',
      label: 'Оружие',
      icon: Target
    },
    {
      href: '/admin/artifacts',
      label: 'Артефакты',
      icon: Target
    },
    {
      href: '/admin/articles',
      label: 'Статьи',
      icon: FileText
    },
    {
      href: '/admin/news',
      label: 'Новости',
      icon: Target
    },
    {
      href: '/admin/users',
      label: 'Пользователи',
      icon: Target
    },
    {
      href: '/admin/settings',
      label: 'Настройки',
      icon: Settings
    },
    {
      href: '/admin/advertisements',
      label: 'Реклама',
      icon: Megaphone
    },
    {
      href: '/admin/logs',
      label: 'Логи',
      icon: LogsIcon
    },
    {
      href: '/admin/files',
      label: 'Файлы',
      icon: FolderOpen
    }
  ];

  return (
    <aside className={`w-64 xl:w-72 bg-neutral-800/60 backdrop-blur-sm flex flex-col justify-between border-r border-neutral-700/60 p-4 ${className}`}>
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base">R</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">ReGuides</h1>
            <p className="text-xs text-neutral-400">Админ-панель</p>
          </div>
        </div>
        <nav>
          <ul className="space-y-0.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-150 text-sm font-medium gap-2 group ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-700 to-fuchsia-700 text-fuchsia-300 shadow-md shadow-fuchsia-600/10' 
                        : 'text-gray-300 hover:bg-neutral-700/60 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-fuchsia-300' : 'text-neutral-400 group-hover:text-white'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-fuchsia-400 rounded-full"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-neutral-700/40 mt-5 pt-3">
          <h3 className="text-xs font-semibold text-neutral-400 mb-2 tracking-wide uppercase">Статистика</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Персонажей:</span>
              <span className="text-white font-semibold">{loading ? 'Загрузка...' : navigationStats.characters}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Оружия:</span>
              <span className="text-white font-semibold">{loading ? 'Загрузка...' : navigationStats.weapons}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Артефактов:</span>
              <span className="text-white font-semibold">{loading ? 'Загрузка...' : navigationStats.artifacts}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Новостей:</span>
              <span className="text-white font-semibold">{loading ? 'Загрузка...' : navigationStats.news}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Пользователей:</span>
              <span className="text-white font-semibold">{loading ? 'Загрузка...' : navigationStats.users}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Рекламы:</span>
              <span className="text-white font-semibold">{loading ? 'Загрузка...' : navigationStats.advertisements}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-700/40 mt-4 pt-3">
          <h3 className="text-xs font-semibold text-neutral-400 mb-2 tracking-wide uppercase">Документы</h3>
          <div className="space-y-1">
            <Link 
              href="/privacy-policy" 
              className="flex items-center text-xs text-neutral-400 hover:text-white transition-colors gap-2 px-2 py-1 rounded hover:bg-neutral-700/40"
            >
              <FileText className="w-3 h-3" />
              <span>Политика конфиденциальности</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
} 