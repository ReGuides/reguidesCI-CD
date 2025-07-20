import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Защищаем только админские маршруты
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Проверяем JWT токен
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      
      // Проверяем роль пользователя
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Токен валиден, продолжаем
      return NextResponse.next();
    } catch (error) {
      // Токен невалиден, перенаправляем на логин
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 