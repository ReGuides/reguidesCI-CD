import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ArtifactModel } from '@/models/Artifact';

export async function GET() {
  try {
    await connectDB();
    
    const artifacts = await ArtifactModel.find({})
      .select('id name rarity image')
      .sort({ name: 1 });

    return NextResponse.json({ data: artifacts });
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    return NextResponse.json({ error: 'Failed to fetch artifacts' }, { status: 500 });
  }
} 