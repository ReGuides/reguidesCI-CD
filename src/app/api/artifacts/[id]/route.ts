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
    
    console.log('Searching for artifact with ID:', id);
    
    const artifact = await ArtifactModel.findOne({ id }).lean();
    
    if (!artifact) {
      console.log('Artifact not found for ID:', id);
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }
    
    console.log('Found artifact:', artifact);
    console.log('All artifact object keys:', Object.keys(artifact));
    
    // Убеждаемся, что id поле присутствует
    const result = {
      id: (artifact as any).id || (artifact as any)._id?.toString(),
      name: (artifact as any).name?.toString() || '',
      rarity: Array.isArray((artifact as any).rarity) && (artifact as any).rarity.length > 0
        ? (artifact as any).rarity.map((r: any) => Number(r))
        : [5],
      bonus1: (artifact as any).bonus1?.toString() || undefined,
      bonus2: (artifact as any).bonus2?.toString() || undefined,
      bonus4: (artifact as any).bonus4?.toString() || undefined,
      pieces: (artifact as any).pieces || 5,
      image: (artifact as any).image?.toString() || ''
    };
    
    console.log('Returning artifact data:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching artifact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artifact' },
      { status: 500 }
    );
  }
} 