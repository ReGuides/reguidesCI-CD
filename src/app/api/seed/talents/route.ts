import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { TalentModel } from '@/models/Talent';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { characterId } = body;
    
    if (!characterId) {
      return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

    // Тестовые данные талантов для персонажа
    const talents = [
      {
        characterId,
        name: 'Обычная атака',
        type: 'normal',
        description: 'Обычная атака персонажа'
      },
      {
        characterId,
        name: 'Элементальный навык',
        type: 'skill',
        description: 'Элементальный навык персонажа'
      },
      {
        characterId,
        name: 'Взрыв стихии',
        type: 'burst',
        description: 'Взрыв стихии персонажа'
      },
      {
        characterId,
        name: 'Пассивный талант 1',
        type: 'passive',
        description: 'Первый пассивный талант персонажа'
      },
      {
        characterId,
        name: 'Пассивный талант 2',
        type: 'passive',
        description: 'Второй пассивный талант персонажа'
      }
    ];

    // Удаляем существующие таланты для этого персонажа
    await TalentModel.deleteMany({ characterId });

    // Добавляем новые таланты
    const createdTalents = await TalentModel.insertMany(talents);

    console.log('Created talents for character:', characterId, createdTalents);

    return NextResponse.json({ 
      success: true, 
      message: `Created ${createdTalents.length} talents for character ${characterId}`,
      talents: createdTalents
    });
  } catch (error) {
    console.error('Error seeding talents:', error);
    return NextResponse.json({ error: 'Failed to seed talents' }, { status: 500 });
  }
} 