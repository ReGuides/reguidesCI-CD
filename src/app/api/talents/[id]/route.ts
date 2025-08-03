import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Talent } from '@/models/Talent';

interface TalentItem {
  _id?: string;
  name: string;
  type: string;
  description: string;
  cooldown?: string;
  energyCost?: number;
  priority?: number;
  scaling?: Record<string, Record<string, string>>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Сначала ищем талант по типу в любом документе
    let talentDoc = await Talent.findOne({
      'talents.type': id
    });
    
    if (talentDoc) {
      // Находим конкретный талант в массиве
      const talent = talentDoc.talents.find((t: TalentItem) => t.type === id);
      if (talent) {
        return NextResponse.json(talent);
      }
    }

    // Если не найден по типу, попробуем найти по типу в полных ID
    talentDoc = await Talent.findOne({
      'talents._id': { $regex: `^${id}_` }
    });
    
    if (talentDoc) {
      // Находим талант, который начинается с нужного типа
      const talent = talentDoc.talents.find((t: TalentItem) => 
        t._id?.toString().startsWith(`${id}_`)
      );
      if (talent) {
        return NextResponse.json(talent);
      }
    }

    // Если не найден по типу, попробуем найти по characterId
    talentDoc = await Talent.findOne({ characterId: id });
    
    if (talentDoc) {
      // Ищем талант по типу или имени в найденном документе
      const talent = talentDoc.talents.find((t: TalentItem) => t.type === id || t.name === id);
      if (talent) {
        return NextResponse.json(talent);
      }
    }
    
    return NextResponse.json(
      { error: 'Talent not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching talent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch talent' },
      { status: 500 }
    );
  }
} 