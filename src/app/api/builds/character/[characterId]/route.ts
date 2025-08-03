import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { BuildModel } from '@/models/Build';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) {
  try {
    await connectDB();
    const { characterId } = await params;

    const builds = await BuildModel.find({ characterId })
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(builds);
  } catch (error) {
    console.error('Error fetching builds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch builds' },
      { status: 500 }
    );
  }
} 