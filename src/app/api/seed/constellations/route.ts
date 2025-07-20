import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ConstellationModel } from '@/models/Constellation';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { characterId } = body;
    
    if (!characterId) {
      return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

    // Тестовые данные созвездий для персонажа
    const constellations = [
      {
        characterId,
        level: 1,
        name: 'Созвездие 1',
        description: 'Первое созвездие персонажа'
      },
      {
        characterId,
        level: 2,
        name: 'Созвездие 2',
        description: 'Второе созвездие персонажа'
      },
      {
        characterId,
        level: 3,
        name: 'Созвездие 3',
        description: 'Третье созвездие персонажа'
      },
      {
        characterId,
        level: 4,
        name: 'Созвездие 4',
        description: 'Четвертое созвездие персонажа'
      },
      {
        characterId,
        level: 5,
        name: 'Созвездие 5',
        description: 'Пятое созвездие персонажа'
      },
      {
        characterId,
        level: 6,
        name: 'Созвездие 6',
        description: 'Шестое созвездие персонажа'
      }
    ];

    // Удаляем существующие созвездия для этого персонажа
    await ConstellationModel.deleteMany({ characterId });

    // Добавляем новые созвездия
    const createdConstellations = await ConstellationModel.insertMany(constellations);

    console.log('Created constellations for character:', characterId, createdConstellations);

    return NextResponse.json({ 
      success: true, 
      message: `Created ${createdConstellations.length} constellations for character ${characterId}`,
      constellations: createdConstellations
    });
  } catch (error) {
    console.error('Error seeding constellations:', error);
    return NextResponse.json({ error: 'Failed to seed constellations' }, { status: 500 });
  }
} 