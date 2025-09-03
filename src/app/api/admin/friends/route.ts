import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { FriendModel } from '@/models/Friend';

export async function GET() {
  try {
    await connectDB();
    
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

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, name, url, logo } = body;
    
    if (!id || !name || !url || !logo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Проверяем, существует ли уже друг с таким id
    const existingFriend = await FriendModel.findOne({ id });
    if (existingFriend) {
      return NextResponse.json(
        { error: 'Friend with this ID already exists' },
        { status: 400 }
      );
    }
    
    const friend = new FriendModel({
      id,
      name,
      url,
      logo
    });
    
    await friend.save();
    
    return NextResponse.json(friend, { status: 201 });
  } catch (error) {
    console.error('Error creating friend:', error);
    return NextResponse.json(
      { error: 'Failed to create friend' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
