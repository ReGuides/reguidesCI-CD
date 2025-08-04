import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    console.log('API: Searching for constellations with characterId:', id);
    
    // Получаем подключение к базе данных
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const constellationsCollection = db.collection('constellations');
    
    const constellationsData = await constellationsCollection.findOne({ characterId: id });
    console.log('API: Found constellations data:', constellationsData);
    
    if (!constellationsData) {
      console.log('API: No constellations found for characterId:', id);
      return NextResponse.json({
        characterId: id,
        constellations: [],
        priorities: [],
        notes: ''
      });
    }
    
    // Преобразуем данные в нужный формат
    const constellations = constellationsData.constellations.map((constellation: any) => ({
      name: constellation.name,
      level: constellation.level,
      description: constellation.description,
      effect: constellation.effect || '',
      priority: constellation.priority || 0
    }));
    
    console.log('API: Processed constellations:', constellations);
    
    return NextResponse.json({
      characterId: constellationsData.characterId,
      constellations: constellations,
      priorities: constellationsData.priorities || [],
      notes: constellationsData.notes || ''
    });
  } catch (error) {
    console.error('Error fetching constellations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch constellations', details: errorMessage },
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
    const { constellations, priorities, notes } = body;
    
    if (!Array.isArray(constellations)) {
      return NextResponse.json({ error: 'Constellations must be an array' }, { status: 400 });
    }
    
    // Получаем подключение к базе данных
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const constellationsCollection = db.collection('constellations');
    
    // Проверяем, существует ли уже запись для этого персонажа
    const existingConstellation = await constellationsCollection.findOne({ characterId: id });
    
    if (existingConstellation) {
      // Обновляем существующую запись
      await constellationsCollection.updateOne(
        { characterId: id },
        {
          $set: {
            constellations: constellations,
            priorities: priorities || [],
            notes: notes || '',
            updatedAt: new Date()
          }
        }
      );
    } else {
      // Создаем новую запись
      await constellationsCollection.insertOne({
        characterId: id,
        constellations: constellations,
        priorities: priorities || [],
        notes: notes || '',
        updatedAt: new Date()
      });
    }
    
    return NextResponse.json({ success: true, message: 'Constellations saved successfully' });
  } catch (error) {
    console.error('Error saving constellations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to save constellations', details: errorMessage }, { status: 500 });
  }
} 