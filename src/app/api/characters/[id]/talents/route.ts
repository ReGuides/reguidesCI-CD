import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CharacterTalentsModel } from '@/models/CharacterTalents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const talentsData = await CharacterTalentsModel.findOne({ characterId: id });
    
    if (!talentsData) {
      return NextResponse.json({
        talents: [],
        priorities: [],
        notes: ''
      });
    }
    
    return NextResponse.json({
      talents: talentsData.talents || [],
      priorities: talentsData.priorities || [],
      notes: talentsData.notes || ''
    });
  } catch (error) {
    console.error('Error fetching talents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch talents' },
      { status: 500 }
    );
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
    const existingTalent = await CharacterTalentsModel.findOne({ characterId: id });
    
    if (existingTalent) {
      // Обновляем существующую запись
      existingTalent.talents = talents;
      existingTalent.updatedAt = new Date();
      await existingTalent.save();
    } else {
      // Создаем новую запись
      await CharacterTalentsModel.create({
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