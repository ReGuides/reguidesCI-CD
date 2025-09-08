import type { Metadata } from 'next';
import './globals.css';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import { SiteSettingsProvider } from '@/components/site-settings-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import SidebarWrapper from '@/components/sidebar-wrapper';
import AdvertisementBanner from '@/components/advertisement-banner';
import AdvertisementPopup from '@/components/advertisement-popup';
import { CopyrightConsole } from '@/components/copyright-console';

export const metadata: Metadata = {
  title: {
    default: 'ReGuides - Лучшие гайды по Genshin Impact',
    template: '%s | ReGuides'
  },
  description: 'Подробные гайды по персонажам, оружию и артефактам Genshin Impact. Рекомендации по сборке, таланты, созвездия и многое другое.',
  keywords: ['genshin impact', 'гайды', 'персонажи', 'оружие', 'артефакты', 'сборка', 'рекомендации'],
  authors: [{ name: 'ReGuides' }],
  creator: 'ReGuides',
  publisher: 'ReGuides',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://reguides.ru'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://reguides.ru',
    siteName: 'ReGuides',
    title: 'ReGuides - Лучшие гайды по Genshin Impact',
    description: 'Подробные гайды по персонажам, оружию и артефактам Genshin Impact. Рекомендации по сборке, таланты, созвездия и многое другое.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ReGuides - Гайды по Genshin Impact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReGuides - Лучшие гайды по Genshin Impact',
    description: 'Подробные гайды по персонажам, оружию и артефактам Genshin Impact.',
    images: ['/og-image.jpg'],
  },
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    yandex: 'a3e9f8cfe55d210d',
  },
  other: {
    'copyright': '© 2025 ReGuides. Все права защищены.',
    'author': 'ReGuides',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-neutral-900 text-white min-h-screen flex flex-col">
        <CopyrightConsole />
        <AnalyticsProvider>
          <SiteSettingsProvider />
          <Header />
          <AdvertisementBanner />
          <div className="flex flex-1">
            <main className="flex-1 flex flex-col py-4">
              {children}
            </main>
            <SidebarWrapper />
          </div>
          <Footer />
          <AdvertisementPopup />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
