import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CharacterModel } from '@/models/Character';
import { WeaponModel } from '@/models/Weapon';
import { ArtifactModel } from '@/models/Artifact';

export async function GET() {
  try {
    await connectDB();
    
    // Получаем количество документов в каждой коллекции
    const charactersCount = await CharacterModel.countDocuments();
    const weaponsCount = await WeaponModel.countDocuments();
    const artifactsCount = await ArtifactModel.countDocuments();

    return NextResponse.json({
      characters: charactersCount,
      weapons: weaponsCount,
      artifacts: artifactsCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 