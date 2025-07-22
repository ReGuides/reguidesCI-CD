import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ArtifactModel } from '@/models/Artifact';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const artifact = await ArtifactModel.findOne({ id });
    
    if (!artifact) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: artifact.id,
      name: artifact.name,
      rarity: Array.isArray(artifact.rarity) && artifact.rarity.length > 0
        ? artifact.rarity
        : [5],
      bonus1: artifact.bonus1,
      bonus2: artifact.bonus2,
      bonus4: artifact.bonus4,
      pieces: artifact.pieces,
      image: artifact.image
    });
  } catch (error) {
    console.error('Error fetching artifact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artifact' },
      { status: 500 }
    );
  }
} 