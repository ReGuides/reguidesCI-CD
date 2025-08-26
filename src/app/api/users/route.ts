import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';

interface UserQuery {
  role?: string;
  isActive?: boolean;
  $or?: Array<{
    name?: { $regex: string; $options: string };
    login?: { $regex: string; $options: string };
  }>;
}

// GET - получение всех пользователей
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const query: UserQuery = {};
    
    if (role && ['user', 'admin', 'moderator'].includes(role)) {
      query.role = role;
    }
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { login: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password') // Исключаем пароль из ответа
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - создание нового пользователя
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, login, password, role, avatar, isActive } = body;

    // Валидация
    if (!name || !login || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Name, login, password and role are required' },
        { status: 400 }
      );
    }

    if (!['user', 'admin', 'moderator'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Проверяем, что login уникален
    const existingUser = await User.findOne({ login });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this login already exists' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      login,
      password: hashedPassword,
      role,
      avatar,
      isActive: isActive !== undefined ? isActive : true
    });

    await user.save();

    // Возвращаем пользователя без пароля
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
