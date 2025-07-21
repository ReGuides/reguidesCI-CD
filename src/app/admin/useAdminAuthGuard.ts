import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { AdminJwtPayload } from './AdminAuthContext';

export function useAdminAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    let token = '';
    // Сначала пробуем из cookie (SSR), потом из localStorage (SPA)
    if (typeof document !== 'undefined') {
      // Извлекаем из cookie
      const match = document.cookie.match(/adminToken=([^;]+)/);
      if (match) token = match[1];
      // Если нет — пробуем из localStorage (fallback)
      if (!token) token = localStorage.getItem('adminToken') || '';
    }
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    try {
      const decoded = jwtDecode<AdminJwtPayload>(token);
      if (!decoded || decoded.role !== 'admin' || (decoded.exp && Date.now() / 1000 > decoded.exp)) {
        router.replace('/admin/login');
      }
    } catch {
      router.replace('/admin/login');
    }
  }, [router]);
} 