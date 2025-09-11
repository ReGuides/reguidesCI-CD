import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthManager } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Проверяем, является ли это админским роутом
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Получаем access токен из cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    
    if (!accessToken) {
      // Нет токена - редирект на логин
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Проверяем валидность токена
    const decoded = AuthManager.verifyAccessToken(accessToken);
    
    if (!decoded) {
      // Токен невалидный - редирект на логин
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Токен валидный - продолжаем
    return NextResponse.next();
  }
  
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
  
  return NextResponse.next();
}

// Конфигурация middleware
export const config = {
  matcher: [
    '/admin/:path*'
  ]
};