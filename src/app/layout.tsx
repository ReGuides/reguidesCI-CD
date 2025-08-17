import type { Metadata } from 'next';
import './globals.css';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { SiteSettingsProvider } from '@/components/site-settings-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import SidebarWrapper from '@/components/sidebar-wrapper';
import AdvertisementBanner from '@/components/advertisement-banner';
import AdvertisementPopup from '@/components/advertisement-popup';

export const metadata: Metadata = {
  title: 'ReGuides',
  description: 'Лучшие гайды по Genshin Impact',
  icons: {
    icon: '/favicon.ico',
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
        <AnalyticsProvider>
          <SiteSettingsProvider />
          <AdvertisementBanner />
          <Header />
          <div className="flex flex-1">
            <SidebarWrapper />
            <main className="flex-1 flex flex-col py-4">
              {children}
            </main>
          </div>
          <Footer />
          <AdvertisementPopup />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
