import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import SidebarWrapper from '@/components/sidebar-wrapper';
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
        <SiteSettingsProvider />
        <div className="min-h-screen bg-neutral-900 text-white">
          <Header />
          <div className="flex min-h-screen">
            <main className="flex-1 min-w-0 py-4">
              {children}
            </main>
            <SidebarWrapper />
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
