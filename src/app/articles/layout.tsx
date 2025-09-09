import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Полезные гайды и советы для персонажей Genshin Impact | ReGuides',
  description: 'Полезные гайды и советы для персонажей Genshin Impact. Актуальные новости, статьи, обновления игры, события и дни рождения персонажей.',
  keywords: 'Genshin Impact, гайды, советы, персонажи, статьи, новости, обновления, события',
  authors: [{ name: 'ReGuides' }],
  creator: 'ReGuides',
  publisher: 'ReGuides',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    title: 'Полезные гайды и советы для персонажей Genshin Impact | ReGuides',
    description: 'Полезные гайды и советы для персонажей Genshin Impact. Актуальные новости, статьи, обновления игры, события и дни рождения персонажей.',
    url: 'https://reguides.ru/articles',
    siteName: 'ReGuides',
    locale: 'ru_RU',
    images: [
      {
        url: 'https://reguides.ru/images/logos/logo.png',
        width: 1200,
        height: 630,
        alt: 'ReGuides - Полезные гайды и советы для персонажей Genshin Impact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Полезные гайды и советы для персонажей Genshin Impact | ReGuides',
    description: 'Полезные гайды и советы для персонажей Genshin Impact. Актуальные новости, статьи, обновления игры, события и дни рождения персонажей.',
    images: ['https://reguides.ru/images/logos/logo.png'],
    creator: '@reguides',
    site: '@reguides',
  },
  alternates: {
    canonical: 'https://reguides.ru/articles',
  },
  other: {
    'article:author': 'ReGuides',
    'article:section': 'Genshin Impact',
  },
};

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}