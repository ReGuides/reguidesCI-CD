import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Артефакты Genshin Impact - Гайды и рекомендации | ReGuides',
  description: 'Полные гайды по всем артефактам Genshin Impact. Рекомендации по сборкам, бонусам и комбинациям. Лучшие артефакты для каждого персонажа.',
  keywords: [
    'genshin impact',
    'артефакты',
    'гайды',
    'сборки',
    'бонусы',
    'комбинации',
    'рекомендации',
    'персонажи',
    'статы'
  ],
  openGraph: {
    title: 'Артефакты Genshin Impact - Гайды и рекомендации | ReGuides',
    description: 'Полные гайды по всем артефактам Genshin Impact. Рекомендации по сборкам, бонусам и комбинациям.',
    type: 'website',
    url: 'https://reguides.ru/artifacts',
    images: [
      {
        url: 'https://reguides.ru/images/logos/logo.png',
        width: 1200,
        height: 630,
        alt: 'ReGuides - Гайды по артефактам Genshin Impact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Артефакты Genshin Impact - Гайды и рекомендации | ReGuides',
    description: 'Полные гайды по всем артефактам Genshin Impact. Рекомендации по сборкам, бонусам и комбинациям.',
    images: ['https://reguides.ru/images/logos/logo.png'],
  },
  alternates: {
    canonical: '/artifacts',
  },
};

export default function ArtifactsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
