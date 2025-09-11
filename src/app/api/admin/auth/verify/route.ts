import { NextRequest, NextResponse } from 'next/server';
import { AuthManager } from '@/lib/auth';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    // Получаем токен из cookies или Authorization header
    const accessToken = request.cookies.get('accessToken')?.value || 
                      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, valid: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // Проверяем токен
    const decoded = AuthManager.verifyAccessToken(accessToken);
    
    if (!decoded) {
      addServerLog('warn', 'admin-auth', 'Invalid access token');
      return NextResponse.json(
        { success: false, valid: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Возвращаем данные пользователя
    return NextResponse.json({
      success: true,
      valid: true,
      user: {
        id: decoded.userId,
        username: decoded.username,
        role: decoded.role
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'admin-auth', 'Token verification error', { error: errorMessage });
    
    return NextResponse.json(
      { success: false, valid: false, error: 'Token verification failed' },
      { status: 500 }
    );
  }
}

// GET метод для быстрой проверки
export async function GET(request: NextRequest) {
  return POST(request);
}
