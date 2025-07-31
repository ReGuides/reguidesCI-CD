import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CharacterConstellationsModel } from '@/models/CharacterConstellations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const constellationsData = await CharacterConstellationsModel.findOne({ characterId: id });
    
    if (!constellationsData) {
      return NextResponse.json({
        constellations: [],
        priorities: [],
        notes: ''
      });
    }
    
    return NextResponse.json({
      constellations: constellationsData.constellations || [],
      priorities: constellationsData.priorities || [],
      notes: constellationsData.notes || ''
    });
  } catch (error) {
    console.error('Error fetching constellations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch constellations' },
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
    const { constellations } = body;
    
    if (!Array.isArray(constellations)) {
      return NextResponse.json({ error: 'Constellations must be an array' }, { status: 400 });
    }
    
    // Проверяем, существует ли уже запись для этого персонажа
    const existingConstellation = await CharacterConstellationsModel.findOne({ characterId: id });
    
    if (existingConstellation) {
      // Обновляем существующую запись
      existingConstellation.constellations = constellations;
      existingConstellation.updatedAt = new Date();
      await existingConstellation.save();
    } else {
      // Создаем новую запись
      await CharacterConstellationsModel.create({
        characterId: id,
        constellations: constellations,
        updatedAt: new Date()
      });
    }
    
    return NextResponse.json({ success: true, message: 'Constellations saved successfully' });
  } catch (error) {
    console.error('Error saving constellations:', error);
    return NextResponse.json({ error: 'Failed to save constellations' }, { status: 500 });
  }
} 