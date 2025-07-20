import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ArtifactModel } from '@/models/Artifact';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Получаем первые 5 артефактов для отладки
    const artifacts = await ArtifactModel.find({}).limit(5);
    
    const debugData = artifacts.map(artifact => ({
      id: artifact.id,
      name: artifact.name,
      image: artifact.image,
      rarity: artifact.rarity
    }));
    
    return NextResponse.json({
      success: true,
      debug: debugData,
      total: await ArtifactModel.countDocuments()
    });
  } catch (error) {
    console.error('Error fetching artifacts debug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artifacts debug' },
      { status: 500 }
    );
  }
} 