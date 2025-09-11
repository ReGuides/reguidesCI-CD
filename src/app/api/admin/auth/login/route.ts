import { NextRequest, NextResponse } from 'next/server';
import { AuthManager } from '@/lib/auth';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Проверяем обязательные поля
    if (!username || !password) {
      addServerLog('warning', 'admin-auth', 'Login attempt with missing credentials');
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Проверяем credentials
    const user = await AuthManager.validateCredentials(username, password);
    
    if (!user) {
      addServerLog('warning', 'admin-auth', 'Failed login attempt', { username });
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Создаем токены
    const { accessToken, refreshToken } = await AuthManager.createTokenPair(
      user.userId,
      user.username
    );

    // Создаем response с токенами
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.userId,
        username: user.username
      }
    });

    // Устанавливаем токены в httpOnly cookies для безопасности
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 // 15 минут
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 дней
    });

    addServerLog('info', 'admin-auth', 'Successful login', { 
      username: user.username,
      userId: user.userId 
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'admin-auth', 'Login error', { error: errorMessage });
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
