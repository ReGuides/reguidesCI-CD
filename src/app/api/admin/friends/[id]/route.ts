import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { FriendModel } from '@/models/Friend';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const { name, url, logo } = body;
    
    if (!name || !url || !logo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const friend = await FriendModel.findOneAndUpdate(
      { id },
      { name, url, logo },
      { new: true, runValidators: true }
    );
    
    if (!friend) {
      return NextResponse.json(
        { error: 'Friend not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(friend);
  } catch (error) {
    console.error('Error updating friend:', error);
    return NextResponse.json(
      { error: 'Failed to update friend' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const friend = await FriendModel.findOneAndDelete({ id });
    
    if (!friend) {
      return NextResponse.json(
        { error: 'Friend not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Friend deleted successfully' });
  } catch (error) {
    console.error('Error deleting friend:', error);
    return NextResponse.json(
      { error: 'Failed to delete friend' },
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
