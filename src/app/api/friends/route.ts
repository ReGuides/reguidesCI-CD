import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { FriendModel } from '@/models/Friend';

export async function GET() {
  try {
    await connectDB();
    
    // Получаем всех друзей, отсортированных по id
    const friends = await FriendModel.find({})
      .sort({ id: 1 })
      .lean();
    
    return NextResponse.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 }
    );
  }
} 