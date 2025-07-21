import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

export interface AdminUser {
  id: string;
  name?: string;
  email?: string;
  role: string;
  avatar?: string;
  username?: string;
  login?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  login: (token: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  // Инициализация user из токена
  useEffect(() => {
    let token = '';
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/adminToken=([^;]+)/);
      if (match) token = match[1];
      if (!token) token = localStorage.getItem('adminToken') || '';
    }
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded || !decoded.id) {
        setUser(null);
        return;
      }
      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        avatar: decoded.avatar,
        username: decoded.username,
        login: decoded.login,
      });
    } catch {
      setUser(null);
    }
  }, []);

  // Логин: сохраняем токен, обновляем user
  const login = (token: string) => {
    if (typeof document !== 'undefined') {
      document.cookie = `adminToken=${token}; path=/;`;
      localStorage.setItem('adminToken', token);
    }
    try {
      const decoded: any = jwtDecode(token);
      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        avatar: decoded.avatar,
        username: decoded.username,
        login: decoded.login,
      });
    } catch {
      setUser(null);
    }
  };

  // Логаут: удаляем токен, сбрасываем user
  const logout = () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'adminToken=; Max-Age=0; path=/;';
      localStorage.removeItem('adminToken');
    }
    setUser(null);
    router.replace('/admin/login');
  };

  return (
    <AdminAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
} 