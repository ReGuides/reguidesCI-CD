import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
      console.log('AdminAuthContext: Checking auth status...');
      const response = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        credentials: 'include'
      });

      console.log('AdminAuthContext: Auth response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('AdminAuthContext: Auth response data:', data);
        if (data.success && data.user) {
          setUser(data.user);
          console.log('AdminAuthContext: User set:', data.user);
        } else {
          setUser(null);
          console.log('AdminAuthContext: No user data, setting user to null');
        }
      } else {
        setUser(null);
        console.log('AdminAuthContext: Auth failed, setting user to null');
      }
    } catch (error) {
      console.error('AdminAuthContext: Auth check failed:', error);
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