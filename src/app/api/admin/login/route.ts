import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// В реальном проекте эти данные должны быть в базе данных
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // В продакшене используйте хешированные пароли
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Проверяем учетные данные
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Создаем JWT токен
      const token = jwt.sign(
        { 
          username, 
          role: 'admin',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 часа
        },
        JWT_SECRET
      );

      return NextResponse.json({
        success: true,
        token,
        user: {
          username,
          role: 'admin'
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Неверные учетные данные' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 