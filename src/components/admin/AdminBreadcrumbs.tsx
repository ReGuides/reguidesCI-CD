"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export default function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';
  const breadcrumbs = segments.map((segment, i) => {
    currentPath += `/${segment}`;
    let label = segment;
    switch (segment) {
      case 'admin': label = 'Админ-панель'; break;
      case 'characters': label = 'Персонажи'; break;
      case 'weapons': label = 'Оружие'; break;
      case 'artifacts': label = 'Артефакты'; break;
      case 'articles': label = 'Статьи'; break;
      case 'analytics': label = 'Аналитика'; break;
      case 'settings': label = 'Настройки'; break;
      default: label = segment.charAt(0).toUpperCase() + segment.slice(1);
    }
    return {
      href: currentPath,
      label,
      isLast: i === segments.length - 1
    };
  });

  return (
    <div className="px-6 py-3 border-b border-neutral-700 bg-neutral-800/30">
      <nav className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-neutral-500 mx-2" />
            )}
            {crumb.isLast ? (
              <span className="text-white font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
} 