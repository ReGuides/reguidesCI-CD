import { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

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
      const match = document.cookie.match(/adminToken=([^;]+)/);
      if (match) token = match[1];
      if (!token) token = localStorage.getItem('adminToken') || '';
    }
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
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