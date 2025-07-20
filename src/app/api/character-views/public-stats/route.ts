import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CharacterModel } from '@/models/Character';

export async function GET() {
  try {
    await connectDB();
    
    // Получаем всех персонажей с их просмотрами
    const characters = await CharacterModel.find({}, 'id views').lean();
    
    // Форматируем данные для фронтенда
    const stats = characters.map(char => ({
      characterId: char.id,
      totalViews: char.views || 0
    }));
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching character view stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character view stats' },
      { status: 500 }
    );
  }
} 