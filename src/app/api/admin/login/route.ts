import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@/lib/db/models/User';
import { connectToDatabase } from '@/lib/db/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = 24 * 60 * 60; // 24 часа

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();
    await connectToDatabase();

    // Ищем пользователя по email, username, login, name
    const user = await User.findOne({
      $or: [
        { email: email || username },
        { username: username },
        { login: username },
        { name: username }
      ],
      isActive: true
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден или неактивен' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    // Генерируем JWT-токен (теперь с avatar, username, login)
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        username: user.username,
        login: user.login,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Кладём токен в httpOnly cookie для SSR/middleware
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        username: user.username,
        login: user.login,
      }
    });
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: JWT_EXPIRES_IN,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 