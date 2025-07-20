import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ConstellationModel } from '@/models/Constellation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    console.log('API: Fetching constellations for character:', id);
    
    const constellationData = await ConstellationModel.findOne({ characterId: id });

    if (!constellationData) {
      console.log('API: No constellation data found for character:', id);
      return NextResponse.json({ constellations: [] });
    }
    
    console.log('API: Found constellation data with', constellationData.constellations?.length || 0, 'constellations');

    return NextResponse.json({ constellations: constellationData.constellations || [] });
  } catch (error) {
    console.error('API: Error fetching constellations:', error);
    return NextResponse.json({ error: 'Failed to fetch constellations' }, { status: 500 });
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
    const existingConstellation = await ConstellationModel.findOne({ characterId: id });
    
    if (existingConstellation) {
      // Обновляем существующую запись
      existingConstellation.constellations = constellations;
      existingConstellation.updatedAt = new Date();
      await existingConstellation.save();
    } else {
      // Создаем новую запись
      await ConstellationModel.create({
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