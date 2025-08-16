import { NextRequest } from 'next/server';

export function getClientIP(request: NextRequest): string {
  // Проверяем заголовки в порядке приоритета
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for может содержать несколько IP через запятую
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback на connection.remoteAddress (если доступно)
  return 'unknown';
}
