import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Оружие Genshin Impact - Гайды и рекомендации | ReGuides',
  description: 'Полные гайды по всему оружию Genshin Impact. Рекомендации по выбору оружия, статам и улучшениям. Лучшее оружие для каждого персонажа.',
  keywords: [
    'genshin impact',
    'оружие',
    'гайды',
    'рекомендации',
    'статы',
    'улучшения',
    'персонажи',
    'сборки',
    'билды'
  ],
  openGraph: {
    title: 'Оружие Genshin Impact - Гайды и рекомендации | ReGuides',
    description: 'Полные гайды по всему оружию Genshin Impact. Рекомендации по выбору оружия, статам и улучшениям.',
    type: 'website',
    url: 'https://reguides.ru/weapons',
    images: [
      {
        url: 'https://reguides.ru/images/logos/logo.png',
        width: 1200,
        height: 630,
        alt: 'ReGuides - Гайды по оружию Genshin Impact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Оружие Genshin Impact - Гайды и рекомендации | ReGuides',
    description: 'Полные гайды по всему оружию Genshin Impact. Рекомендации по выбору оружия, статам и улучшениям.',
    images: ['https://reguides.ru/images/logos/logo.png'],
  },
  alternates: {
    canonical: '/weapons',
  },
};

export default function WeaponsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
