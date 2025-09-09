import type { Metadata } from 'next';
import { getImageDimensions } from '@/lib/image-dimensions';

const imageDimensions = getImageDimensions('weapon');

export const metadata: Metadata = {
  title: 'Оружие Genshin Impact - Гайды и рекомендации | ReGuides',
  description: 'Полный каталог оружия Genshin Impact с рекомендациями по персонажам. Статистика, пассивные способности, материалы для улучшения и лучшие сборки.',
  keywords: [
    'genshin impact',
    'оружие',
    'гайды',
    'рекомендации',
    'статистика',
    'пассивные способности',
    'материалы',
    'улучшение',
    'сборки',
    'каталог',
    'меч',
    'копье',
    'лук',
    'катализатор',
    'двуручный меч'
  ],
  openGraph: {
    title: 'Оружие Genshin Impact - Гайды и рекомендации | ReGuides',
    description: 'Полный каталог оружия Genshin Impact с рекомендациями по персонажам. Статистика, пассивные способности, материалы для улучшения.',
    type: 'website',
    url: 'https://reguides.ru/weapons',
    images: [
      {
        url: 'https://reguides.ru/images/logos/logo.png',
        width: imageDimensions.width,
        height: imageDimensions.height,
        alt: 'ReGuides - Гайды по оружию Genshin Impact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Оружие Genshin Impact - Гайды и рекомендации | ReGuides',
    description: 'Полный каталог оружия Genshin Impact с рекомендациями по персонажам. Статистика, пассивные способности, материалы для улучшения.',
    images: ['https://reguides.ru/images/logos/logo.png'],
  },
  alternates: {
    canonical: '/weapons',
  },
};

export default function WeaponsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}