import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import SidebarWrapper from '@/components/sidebar-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReGuides - Genshin Impact Database',
  description: 'Comprehensive database for Genshin Impact characters, weapons, and artifacts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} overflow-x-hidden`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          
          {/* Main Content */}
          <main className="flex-1 bg-neutral-900">
            <div className="flex w-full">
              <div className="flex-1 min-w-0">
                {children}
              </div>
              <SidebarWrapper />
            </div>
          </main>
          
          <Footer />
        </div>
      </body>
    </html>
  );
}
