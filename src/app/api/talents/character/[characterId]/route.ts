import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Talent } from '@/models/Talent';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) {
  try {
    await connectDB();
    const { characterId } = await params;

    // Ищем документ с талантами персонажа
    let talentDoc = await Talent.findOne({ characterId });
    
    if (!talentDoc) {
      // Если талантов нет, создаем новый документ (как в старом сайте)
      talentDoc = new Talent({
        characterId,
        talents: [],
        priorities: [],
        updatedAt: new Date()
      });
      
      await talentDoc.save();
    }
    
    return NextResponse.json(talentDoc);
  } catch (error) {
    console.error('Error fetching talents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch talents' },
      { status: 500 }
    );
  }
} 