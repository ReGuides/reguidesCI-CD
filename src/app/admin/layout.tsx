'use client';
import { useAdminAuthGuard } from './useAdminAuthGuard';
import { AdminAuthProvider } from './AdminAuthContext';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import Link from 'next/link';
import { BarChart3, FileText } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAdminAuthGuard();
  return (
    <AdminAuthProvider>
      <div className="flex min-h-screen">
        <AdminNavigation />
        <div className="flex-1 min-w-0 flex flex-col">
          <AdminHeader />
          <AdminBreadcrumbs />
          <main className="flex-1">
            {children}
            <Link href="/admin/analytics" className="flex items-center space-x-2 p-2 rounded hover:bg-neutral-700">
              <BarChart3 className="w-5 h-5" />
              <span>Аналитика</span>
            </Link>
            <Link href="/admin/news" className="flex items-center space-x-2 p-2 rounded hover:bg-neutral-700">
              <FileText className="w-5 h-5" />
              <span>Новости</span>
            </Link>
          </main>
        </div>
      </div>
    </AdminAuthProvider>
  );
} 