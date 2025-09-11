import { NextRequest, NextResponse } from 'next/server';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    // Создаем response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    // Очищаем cookies
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Немедленно истекает
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Немедленно истекает
    });

    addServerLog('info', 'admin-auth', 'User logged out');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'admin-auth', 'Logout error', { error: errorMessage });
    
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
