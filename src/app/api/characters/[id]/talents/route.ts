import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Talent } from '@/models/Talent';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('API: GET /api/characters/[id]/talents - Starting request');
    await connectDB();
    
    const { id } = await params;
    console.log('API: Character ID:', id);
    
    const talentsData = await Talent.findOne({ characterId: id });
    console.log('API: Found talents data:', talentsData);
    
    if (!talentsData) {
      console.log('API: No talents data found, returning empty array');
      return NextResponse.json({
        talents: [],
        priorities: [],
        notes: ''
      });
    }
    
    const response = {
      talents: talentsData.talents || [],
      priorities: talentsData.priorities || [],
      notes: talentsData.notes || ''
    };
    console.log('API: Returning response:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API: Error fetching talents:', error);
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
    console.log('API: POST /api/characters/[id]/talents - Starting request');
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const { talents } = body;
    
    console.log('API: Character ID:', id);
    console.log('API: Received talents:', talents);
    
    if (!Array.isArray(talents)) {
      return NextResponse.json({ error: 'Talents must be an array' }, { status: 400 });
    }
    
    // Проверяем, существует ли уже запись для этого персонажа
    const existingTalent = await Talent.findOne({ characterId: id });
    
    if (existingTalent) {
      // Обновляем существующую запись
      existingTalent.talents = talents;
      existingTalent.updatedAt = new Date();
      await existingTalent.save();
      console.log('API: Updated existing talents record');
    } else {
      // Создаем новую запись
      await Talent.create({
        characterId: id,
        talents: talents,
        updatedAt: new Date()
      });
      console.log('API: Created new talents record');
    }
    
    return NextResponse.json({ success: true, message: 'Talents saved successfully' });
  } catch (error) {
    console.error('API: Error saving talents:', error);
    return NextResponse.json({ error: 'Failed to save talents' }, { status: 500 });
  }
} 