import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { SiteSettingsProvider } from '@/components/site-settings-provider';

const inter = Inter({ subsets: ['latin'] });

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
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AnalyticsProvider>
          <SiteSettingsProvider />
          <div className="min-h-screen bg-neutral-900 text-white">
            {children}
          </div>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
