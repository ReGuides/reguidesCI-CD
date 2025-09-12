import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthManager } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Если это страница логина и пользователь уже авторизован - редирект в админку
  if (pathname === '/admin/login') {
    const accessToken = request.cookies.get('accessToken')?.value;
    
    if (accessToken) {
      const decoded = AuthManager.verifyAccessToken(accessToken);
      
      if (decoded) {
        // Пользователь уже авторизован - редирект в админку
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }
  
  // Проверяем, является ли это админским роутом (кроме логина)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Получаем токены из cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!accessToken) {
      // Нет access токена - редирект на логин
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Проверяем валидность access токена
    const decoded = AuthManager.verifyAccessToken(accessToken);
    
    if (!decoded) {
      // Access токен невалидный - пытаемся обновить через refresh токен
      if (refreshToken) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          const refreshResponse = await fetch(`${baseUrl}/api/admin/auth/refresh`, {
            method: 'POST',
            headers: {
              'Cookie': request.headers.get('cookie') || ''
            }
          });
          
          if (refreshResponse.ok) {
            // Токен успешно обновлен - получаем новые cookies
            const response = NextResponse.next();
            const setCookieHeader = refreshResponse.headers.get('set-cookie');
            if (setCookieHeader) {
              response.headers.set('set-cookie', setCookieHeader);
            }
            return response;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }
      
      // Не удалось обновить токен - редирект на логин
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Токен валидный - продолжаем без редиректа
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

// Конфигурация middleware
export const config = {
  matcher: [
    '/admin/:path*'
  ]
};