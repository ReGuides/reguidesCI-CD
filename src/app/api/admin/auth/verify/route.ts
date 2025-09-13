import { NextRequest, NextResponse } from 'next/server';
import { AuthManager } from '@/lib/auth';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    // Получаем токен из cookies или Authorization header
    const accessToken = request.cookies.get('accessToken')?.value || 
                      request.headers.get('authorization')?.replace('Bearer ', '');

    addServerLog('debug', 'admin-auth', 'Auth verify request', {
      hasToken: !!accessToken,
      tokenLength: accessToken?.length || 0,
      allCookies: request.cookies.getAll().map(c => c.name)
    });

    if (!accessToken) {
      addServerLog('warn', 'admin-auth', 'No access token provided');
      return NextResponse.json(
        { success: false, valid: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // Проверяем токен
    const decoded = AuthManager.verifyAccessToken(accessToken);
    
    if (!decoded) {
      addServerLog('warn', 'admin-auth', 'Invalid access token', {
        tokenLength: accessToken.length,
        tokenStart: accessToken.substring(0, 20) + '...'
      });
      return NextResponse.json(
        { success: false, valid: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    addServerLog('debug', 'admin-auth', 'Token verified successfully', {
      userId: decoded.userId,
      username: decoded.username
    });

    // Получаем полные данные пользователя из базы данных
    try {
      const { User } = await import('@/lib/db/models/User');
      const { connectToDatabase } = await import('@/lib/db/mongodb');
      
      await connectToDatabase();
      
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        addServerLog('warn', 'admin-auth', 'User not found in database', { userId: decoded.userId });
        return NextResponse.json(
          { success: false, valid: false, error: 'User not found' },
          { status: 401 }
        );
      }

      // Возвращаем полные данные пользователя
      return NextResponse.json({
        success: true,
        valid: true,
        user: {
          id: user._id.toString(),
          username: user.username || user.login || user.name || 'Unknown',
          name: user.name || user.username || user.login || 'Unknown',
          email: user.email,
          role: user.role || 'admin',
          avatar: user.avatar
        }
      });
    } catch (dbError) {
      console.error('Database error during user fetch:', dbError);
      // Если не удалось получить данные из БД, возвращаем базовую информацию из токена
      return NextResponse.json({
        success: true,
        valid: true,
        user: {
          id: decoded.userId,
          username: decoded.username,
          name: decoded.username,
          role: decoded.role
        }
      });
    }

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
