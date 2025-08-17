import { cookies } from 'next/headers';

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Session {
  user: User;
}

// Простая проверка аутентификации для админ-панели
export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');
    
    if (!token) {
      return null;
    }

    // В реальном приложении здесь должна быть проверка JWT токена
    // Для демонстрации используем простую проверку
    if (token.value === 'admin_secret_token') {
      return {
        user: {
          id: '1',
          name: 'Администратор',
          email: 'admin@reguides.com',
          isAdmin: true
        }
      };
    }

    return null;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Проверка, является ли пользователь администратором
export function isAdmin(session: Session | null): boolean {
  return session?.user?.isAdmin === true;
}
