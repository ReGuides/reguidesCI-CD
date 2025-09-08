import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Статьи и новости Genshin Impact | ReGuides',
  description: 'Актуальные новости, статьи и гайды по Genshin Impact. Обновления игры, события, дни рождения персонажей и полезные советы.',
  keywords: [
    'genshin impact',
    'новости',
    'статьи',
    'гайды',
    'обновления',
    'события',
    'дни рождения',
    'персонажи',
    'советы'
  ],
  openGraph: {
    title: 'Статьи и новости Genshin Impact | ReGuides',
    description: 'Актуальные новости, статьи и гайды по Genshin Impact. Обновления игры, события, дни рождения персонажей.',
    type: 'website',
    url: 'https://reguides.ru/articles',
    images: [
      {
        url: 'https://reguides.ru/images/logos/logo.png',
        width: 1200,
        height: 630,
        alt: 'ReGuides - Новости и статьи Genshin Impact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Статьи и новости Genshin Impact | ReGuides',
    description: 'Актуальные новости, статьи и гайды по Genshin Impact. Обновления игры, события, дни рождения персонажей.',
    images: ['https://reguides.ru/images/logos/logo.png'],
  },
  alternates: {
    canonical: '/articles',
  },
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
