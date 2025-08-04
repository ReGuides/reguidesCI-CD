import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Получаем подключение к базе данных
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    // Проверяем коллекцию constellations
    const constellationsCollection = db.collection('constellations');
    const allConstellations = await constellationsCollection.find({}).toArray();
    console.log('Debug API: All constellations in DB:', allConstellations);
    
    // Проверяем конкретно для mavuika
    const mavuikaConstellations = await constellationsCollection.findOne({ characterId: 'mavuika' });
    console.log('Debug API: Mavuika constellations:', mavuikaConstellations);
    
    return NextResponse.json({
      allConstellations: allConstellations,
      mavuikaConstellations: mavuikaConstellations,
      count: allConstellations.length
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: errorMessage },
      { status: 500 }
    );
  }
} 