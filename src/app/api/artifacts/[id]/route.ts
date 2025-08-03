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
    
    const artifact = await ArtifactModel.findOne({ id }).lean();
    
    if (!artifact) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }
    
    // Убеждаемся, что id поле присутствует
    const artifactData = artifact as Record<string, unknown>;
    const result = {
      id: (artifactData.id as string) || (artifactData._id as string)?.toString(),
      name: (artifactData.name as string)?.toString() || '',
      rarity: Array.isArray(artifactData.rarity) && (artifactData.rarity as number[]).length > 0
        ? (artifactData.rarity as number[]).map((r: number) => Number(r))
        : [5],
      bonus1: (artifactData.bonus1 as string)?.toString() || undefined,
      bonus2: (artifactData.bonus2 as string)?.toString() || undefined,
      bonus4: (artifactData.bonus4 as string)?.toString() || undefined,
      pieces: (artifactData.pieces as number) || 5,
      image: (artifactData.image as string)?.toString() || ''
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching artifact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artifact' },
      { status: 500 }
    );
  }
} 