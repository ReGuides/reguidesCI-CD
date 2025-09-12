import { NextRequest, NextResponse } from 'next/server';
import { AuthManager } from '@/lib/auth';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Проверяем обязательные поля
    if (!username || !password) {
      addServerLog('warn', 'admin-auth', 'Login attempt with missing credentials');
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Проверяем credentials
    const user = await AuthManager.validateCredentials(username, password);
    
    if (!user) {
      addServerLog('warn', 'admin-auth', 'Failed login attempt', { username });
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Создаем токены
    const { accessToken, refreshToken } = await AuthManager.createTokenPair(
      user.userId,
      user.username,
      user.role
    );

    // Получаем полные данные пользователя из базы данных
    let fullUserData: {
      id: string;
      username: string;
      name: string;
      role: string;
      email?: string;
      avatar?: string;
    } = {
      id: user.userId,
      username: user.username,
      name: user.username,
      role: user.role
    };

    try {
      const { User } = await import('@/lib/db/models/User');
      const { connectToDatabase } = await import('@/lib/db/mongodb');
      
      await connectToDatabase();
      
      const dbUser = await User.findById(user.userId);
      
      if (dbUser) {
        fullUserData = {
          id: dbUser._id.toString(),
          username: dbUser.username || dbUser.login || dbUser.name || 'Unknown',
          name: dbUser.name || dbUser.username || dbUser.login || 'Unknown',
          email: dbUser.email,
          role: dbUser.role || 'admin',
          avatar: dbUser.avatar
        };
      }
    } catch (dbError) {
      console.error('Database error during user fetch in login:', dbError);
      // Используем базовые данные из токена
    }

    // Создаем response с токенами
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: fullUserData
    });

    // Устанавливаем токены в httpOnly cookies для безопасности
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 // 30 минут
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
