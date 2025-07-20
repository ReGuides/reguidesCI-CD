import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { TalentModel } from '@/models/Talent';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    console.log('API: Fetching talents for character:', id);
    
    const talentData = await TalentModel.findOne({ characterId: id });

    if (!talentData) {
      console.log('API: No talent data found for character:', id);
      return NextResponse.json({ talents: [] });
    }
    
    console.log('API: Found talent data with', talentData.talents?.length || 0, 'talents');

    return NextResponse.json({ talents: talentData.talents || [] });
  } catch (error) {
    console.error('API: Error fetching talents:', error);
    return NextResponse.json({ error: 'Failed to fetch talents' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const { talents } = body;
    
    if (!Array.isArray(talents)) {
      return NextResponse.json({ error: 'Talents must be an array' }, { status: 400 });
    }
    
    // Проверяем, существует ли уже запись для этого персонажа
    const existingTalent = await TalentModel.findOne({ characterId: id });
    
    if (existingTalent) {
      // Обновляем существующую запись
      existingTalent.talents = talents;
      existingTalent.updatedAt = new Date();
      await existingTalent.save();
    } else {
      // Создаем новую запись
      await TalentModel.create({
        characterId: id,
        talents: talents,
        updatedAt: new Date()
      });
    }
    
    return NextResponse.json({ success: true, message: 'Talents saved successfully' });
  } catch (error) {
    console.error('Error saving talents:', error);
    return NextResponse.json({ error: 'Failed to save talents' }, { status: 500 });
  }
} 