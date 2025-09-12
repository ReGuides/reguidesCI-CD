import { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AdminJwtPayload } from './AdminAuthContext';

export interface AdminUser {
  id: string;
  name?: string;
  email?: string;
  role: string;
  avatar?: string;
  username?: string;
  login?: string;
}

export function useAdminUser(): AdminUser | null {
  return useMemo(() => {
    let token = '';
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/accessToken=([^;]+)/);
      if (match) token = match[1];
      if (!token) token = localStorage.getItem('accessToken') || '';
    }
    if (!token) return null;
    try {
      const decoded = jwtDecode<AdminJwtPayload>(token);
      if (!decoded || !decoded.id) return null;
      return {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        avatar: decoded.avatar,
        username: decoded.username,
        login: decoded.login,
      };
    } catch {
      return null;
    }
  }, []);
} 