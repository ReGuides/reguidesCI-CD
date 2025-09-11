import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

export interface AdminJwtPayload {
  id: string;
  name?: string;
  email?: string;
  role: string;
  avatar?: string;
  username?: string;
  login?: string;
  exp?: number;
  iat?: number;
}

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
  login: () => Promise<void>;
  logout: () => Promise<void>;
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
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    }
  };

  // Логин: обновляем user
  const login = async () => {
    await checkAuthStatus();
  };

  // Логаут: удаляем токены, сбрасываем user
  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.replace('/admin/login');
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
} 