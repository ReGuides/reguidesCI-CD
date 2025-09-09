import type { Metadata } from 'next';
import { getImageDimensions } from '@/lib/image-dimensions';

const imageDimensions = getImageDimensions('artifact');

export const metadata: Metadata = {
  title: 'Артефакты Genshin Impact - Гайды и рекомендации | ReGuides',
  description: 'Полный каталог артефактов Genshin Impact с рекомендациями по персонажам. Статистика, бонусы, места получения и лучшие сборки.',
  keywords: [
    'genshin impact',
    'артефакты',
    'гайды',
    'рекомендации',
    'статистика',
    'бонусы',
    'места получения',
    'сборки',
    'каталог',
    'цветок жизни',
    'перо смерти',
    'песочные часы',
    'кубок пространства',
    'корона разума'
  ],
  openGraph: {
    title: 'Артефакты Genshin Impact - Гайды и рекомендации | ReGuides',
    description: 'Полный каталог артефактов Genshin Impact с рекомендациями по персонажам. Статистика, бонусы, места получения.',
    type: 'website',
    url: 'https://reguides.ru/artifacts',
    images: [
      {
        url: 'https://reguides.ru/images/logos/logo.png',
        width: imageDimensions.width,
        height: imageDimensions.height,
        alt: 'ReGuides - Гайды по артефактам Genshin Impact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Артефакты Genshin Impact - Гайды и рекомендации | ReGuides',
    description: 'Полный каталог артефактов Genshin Impact с рекомендациями по персонажам. Статистика, бонусы, места получения.',
    images: ['https://reguides.ru/images/logos/logo.png'],
  },
  alternates: {
    canonical: '/artifacts',
  },
};

export default function ArtifactsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}