import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Character } from '@/lib/db/models/Character';
import { Weapon } from '@/lib/db/models/Weapon';
import { Artifact } from '@/lib/db/models/Artifact';
import { Article } from '@/lib/db/models/Article';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Получаем количество записей в каждой коллекции
    const [characters, weapons, artifacts, articles] = await Promise.all([
      Character.countDocuments(),
      Weapon.countDocuments(),
      Artifact.countDocuments(),
      Article.countDocuments({ isPublished: true })
    ]);

    return NextResponse.json({
      characters,
      weapons,
      artifacts,
      articles
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 