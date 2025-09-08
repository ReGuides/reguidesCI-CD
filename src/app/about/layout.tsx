import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'О проекте ReGuides - Гайды по Genshin Impact | ReGuides',
  description: 'Узнайте больше о проекте ReGuides - платформе с гайдами по персонажам, оружию и артефактам Genshin Impact. Наша команда и миссия.',
  keywords: [
    'reguides',
    'о проекте',
    'genshin impact',
    'гайды',
    'команда',
    'миссия',
    'контакты',
    'поддержка'
  ],
  openGraph: {
    title: 'О проекте ReGuides - Гайды по Genshin Impact | ReGuides',
    description: 'Узнайте больше о проекте ReGuides - платформе с гайдами по персонажам, оружию и артефактам Genshin Impact.',
    type: 'website',
    url: 'https://reguides.ru/about',
    images: [
      {
        url: 'https://reguides.ru/images/logos/logo.png',
        width: 1200,
        height: 630,
        alt: 'ReGuides - О проекте',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'О проекте ReGuides - Гайды по Genshin Impact | ReGuides',
    description: 'Узнайте больше о проекте ReGuides - платформе с гайдами по персонажам, оружию и артефактам Genshin Impact.',
    images: ['https://reguides.ru/images/logos/logo.png'],
  },
  alternates: {
    canonical: '/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
