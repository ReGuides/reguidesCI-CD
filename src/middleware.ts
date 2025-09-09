import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Увеличиваем лимит размера тела запроса для API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Устанавливаем заголовки для увеличения лимита
    response.headers.set('x-body-size-limit', '50mb');
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
