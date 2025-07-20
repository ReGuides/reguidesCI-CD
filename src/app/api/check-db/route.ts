import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getDatabaseURI } from '@/lib/config';

export async function GET() {
  try {
    // Подключаемся к базе данных
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(getDatabaseURI());
    }
    
    // Проверяем, что база данных доступна
    if (!mongoose.connection.db) {
      throw new Error('Database connection not available');
    }
    
    // Получаем список всех коллекций
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    const results: Record<string, { count: number; samples: Record<string, unknown>[] }> = {};
    
    // Проверяем каждую коллекцию
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      
      // Получаем несколько примеров документов
      const samples = await mongoose.connection.db.collection(collectionName)
        .find({})
        .limit(3)
        .toArray();
      
      results[collectionName] = {
        count,
        samples: samples.map((doc: Record<string, unknown>) => {
          // Убираем _id из примера для читаемости
          const { _id: _unused, ...rest } = doc;
          return rest;
        })
      };
    }
    
    return NextResponse.json({
      totalCollections: collections.length,
      collections: results
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json(
      { error: 'Failed to check database' },
      { status: 500 }
    );
  }
} 