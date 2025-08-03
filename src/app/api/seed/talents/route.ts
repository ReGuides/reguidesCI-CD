import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Talent } from '@/models/Talent';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { characterId } = body;
    
    if (!characterId) {
      return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

    // Тестовые данные талантов для персонажа
    const talentsData = [
      {
        name: 'Обычная атака',
        type: 'normal',
        description: 'Обычная атака персонажа',
        cooldown: '1с',
        scaling: {
          'Урон': {
            '1': '100%',
            '2': '110%',
            '3': '120%',
            '4': '130%',
            '5': '140%'
          }
        }
      },
      {
        name: 'Элементальный навык',
        type: 'skill',
        description: 'Элементальный навык персонажа',
        cooldown: '6с',
        energyCost: 0,
        scaling: {
          'Урон навыка': {
            '1': '200%',
            '2': '220%',
            '3': '240%',
            '4': '260%',
            '5': '280%'
          }
        }
      },
      {
        name: 'Взрыв стихии',
        type: 'burst',
        description: 'Взрыв стихии персонажа',
        cooldown: '12с',
        energyCost: 60,
        scaling: {
          'Урон взрыва': {
            '1': '400%',
            '2': '440%',
            '3': '480%',
            '4': '520%',
            '5': '560%'
          }
        }
      },
      {
        name: 'Пассивный талант 1',
        type: 'passive',
        description: 'Первый пассивный талант персонажа'
      },
      {
        name: 'Пассивный талант 2',
        type: 'passive',
        description: 'Второй пассивный талант персонажа'
      }
    ];

    // Удаляем существующие таланты для этого персонажа
    await Talent.deleteMany({ characterId });

    // Создаем новый документ с талантами
    const talentDoc = new Talent({
      characterId,
      talents: talentsData,
      priorities: [
        { talentName: 'Взрыв стихии', priority: 1, description: 'Приоритет 1' },
        { talentName: 'Элементальный навык', priority: 2, description: 'Приоритет 2' },
        { talentName: 'Обычная атака', priority: 3, description: 'Приоритет 3' }
      ],
      notes: 'Тестовые заметки по талантам',
      updatedAt: new Date()
    });

    await talentDoc.save();

    console.log('Created talents for character:', characterId, talentDoc);

    return NextResponse.json({ 
      success: true, 
      message: `Created talents for character ${characterId}`,
      talent: talentDoc
    });
  } catch (error) {
    console.error('Error seeding talents:', error);
    return NextResponse.json({ error: 'Failed to seed talents' }, { status: 500 });
  }
} 