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
  title: 'ReGuides',
  description: 'Лучшие гайды по Genshin Impact',
  icons: {
    icon: '/favicon.ico',
  },
  verification: {
    yandex: 'a3e9f8cfe55d210d',
  },
  other: {
    'copyright': '© 2025 ReGuides. Все права защищены.',
    'author': 'ReGuides',
    'robots': 'index, follow',
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
