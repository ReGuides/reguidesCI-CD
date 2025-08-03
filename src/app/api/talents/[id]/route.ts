import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Talent } from '@/models/Talent';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Ищем документ с талантами персонажа
    let talentDoc = await Talent.findOne({ characterId: id });
    
    if (!talentDoc) {
      // Если не найден по characterId, попробуем найти талант по типу в любом документе
      talentDoc = await Talent.findOne({
        'talents.type': id
      });
      
      if (talentDoc) {
        // Находим конкретный талант в массиве
        const talent = talentDoc.talents.find((t: any) => t.type === id);
        if (talent) {
          return NextResponse.json(talent);
        }
      }
      
      return NextResponse.json(
        { error: 'Talent not found' },
        { status: 404 }
      );
    }

    // Если найден документ по characterId, ищем талант по типу
    const talent = talentDoc.talents.find((t: any) => t.type === id || t.name === id);
    
    if (!talent) {
      return NextResponse.json(
        { error: 'Talent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(talent);
  } catch (error) {
    console.error('Error fetching talent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch talent' },
      { status: 500 }
    );
  }
} 