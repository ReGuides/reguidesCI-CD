import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Персонажи Genshin Impact - Гайды и сборки | ReGuides',
  description: 'Полные гайды по всем персонажам Genshin Impact. Рекомендации по оружию, артефактам, талантам и командам. Актуальные сборки и билды.',
  keywords: [
    'genshin impact',
    'персонажи',
    'гайды',
    'сборки',
    'билды',
    'оружие',
    'артефакты',
    'таланты',
    'команды',
    'рекомендации'
  ],
  openGraph: {
    title: 'Персонажи Genshin Impact - Гайды и сборки | ReGuides',
    description: 'Полные гайды по всем персонажам Genshin Impact. Рекомендации по оружию, артефактам, талантам и командам.',
    type: 'website',
    url: 'https://reguides.ru/characters',
    images: [
      {
        url: 'https://reguides.ru/images/logos/logo.png',
        width: 1200,
        height: 630,
        alt: 'ReGuides - Гайды по персонажам Genshin Impact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Персонажи Genshin Impact - Гайды и сборки | ReGuides',
    description: 'Полные гайды по всем персонажам Genshin Impact. Рекомендации по оружию, артефактам, талантам и командам.',
    images: ['https://reguides.ru/images/logos/logo.png'],
  },
  alternates: {
    canonical: '/characters',
  },
};

export default function CharactersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
