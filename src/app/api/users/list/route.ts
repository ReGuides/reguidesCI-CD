import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';

// GET - получение списка пользователей для выбора в команду
export async function GET() {
  try {
    await connectToDatabase();
    
    // Получаем пользователей с основными полями
    const users = await User.find({}, {
      _id: 1,
      name: 1,
      avatar: 1,
      email: 1
    }).lean();
    
    return NextResponse.json({ 
      success: true, 
      data: users 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
