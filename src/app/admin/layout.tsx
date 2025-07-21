'use client';
import { useAdminAuthGuard } from './useAdminAuthGuard';
import { AdminAuthProvider } from './AdminAuthContext';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';

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
          </main>
        </div>
      </div>
    </AdminAuthProvider>
  );
} 