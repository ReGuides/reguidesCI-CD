import { NextRequest, NextResponse } from 'next/server';
import { AuthManager } from '@/lib/auth';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    // Получаем refresh токен из cookies
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      addServerLog('warn', 'admin-auth', 'Refresh attempt without token');
      return NextResponse.json(
        { success: false, error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Обновляем токены
    const newTokens = AuthManager.refreshAccessToken(refreshToken);
    
    if (!newTokens) {
      addServerLog('warn', 'admin-auth', 'Invalid refresh token');
      return NextResponse.json(
        { success: false, error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Создаем response с новыми токенами
    const response = NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully'
    });

    // Устанавливаем новые токены в cookies
    response.cookies.set('accessToken', newTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 // 30 минут
    });

    response.cookies.set('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 дней
    });

    addServerLog('info', 'admin-auth', 'Tokens refreshed successfully');

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'admin-auth', 'Token refresh error', { error: errorMessage });
    
    return NextResponse.json(
      { success: false, error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
