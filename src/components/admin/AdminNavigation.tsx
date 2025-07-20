'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminButton } from '@/components/ui/admin-button';
import { IconActionButton } from '@/components/ui/icon-action-button';
import { AddButton } from '@/components/ui/add-button';
import { 
  Users, 
  Sword, 
  Shield, 
  FileText, 
  Settings, 
  BarChart3,
  Home,
  ChevronRight,
  Plus,
  Search,
  Bell,
  User,
  LogOut
} from 'lucide-react';

interface AdminNavigationProps {
  className?: string;
  children?: React.ReactNode;
}

export default function AdminNavigation({ className = '', children }: AdminNavigationProps) {
  const pathname = usePathname();

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
      icon: Sword
    },
    {
      href: '/admin/artifacts',
      label: 'Артефакты',
      icon: Shield
    },
    {
      href: '/admin/articles',
      label: 'Статьи',
      icon: FileText
    },
    {
      href: '/admin/settings',
      label: 'Настройки',
      icon: Settings
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
              <span className="text-white font-semibold">127</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Оружия:</span>
              <span className="text-white font-semibold">89</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Артефактов:</span>
              <span className="text-white font-semibold">52</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Статей:</span>
              <span className="text-white font-semibold">24</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
} 