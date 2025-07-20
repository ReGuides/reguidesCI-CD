import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    await connectToDatabase();

    if (!mongoose.connection.db) {
      return NextResponse.json({ message: 'Ошибка подключения к базе данных' }, { status: 500 });
    }

    if (characterId) {
      // Получить рекомендации для конкретного персонажа
      const recommendation = await mongoose.connection.db.collection('recommendations').findOne({ characterId });
      
      if (!recommendation) {
        return NextResponse.json([]);
      }

      return NextResponse.json([recommendation]);
    } else {
      // Получить все рекомендации
      const recommendations = await mongoose.connection.db.collection('recommendations').find({}).toArray();
      return NextResponse.json(recommendations);
    }
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, weapons, artifacts } = body;

    if (!characterId) {
      return NextResponse.json({ message: 'ID персонажа обязателен' }, { status: 400 });
    }

    await connectToDatabase();

    if (!mongoose.connection.db) {
      return NextResponse.json({ message: 'Ошибка подключения к базе данных' }, { status: 500 });
    }

    // Проверяем, существует ли уже рекомендация для этого персонажа
    const existingRecommendation = await mongoose.connection.db.collection('recommendations').findOne({ characterId });

    if (existingRecommendation) {
      return NextResponse.json({ message: 'Рекомендации для этого персонажа уже существуют' }, { status: 409 });
    }

    const recommendation = {
      characterId,
      weapons: weapons || [],
      artifacts: artifacts || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await mongoose.connection.db.collection('recommendations').insertOne(recommendation);

    return NextResponse.json({ 
      ...recommendation, 
      _id: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating recommendation:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, weapons, artifacts } = body;

    if (!characterId) {
      return NextResponse.json({ message: 'ID персонажа обязателен' }, { status: 400 });
    }

    await connectToDatabase();

    if (!mongoose.connection.db) {
      return NextResponse.json({ message: 'Ошибка подключения к базе данных' }, { status: 500 });
    }

    const updateData = {
      weapons: weapons || [],
      artifacts: artifacts || [],
      updatedAt: new Date()
    };

    const result = await mongoose.connection.db.collection('recommendations').updateOne(
      { characterId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Рекомендации не найдены' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Рекомендации обновлены' });
  } catch (error) {
    console.error('Error updating recommendation:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    if (!characterId) {
      return NextResponse.json({ message: 'ID персонажа обязателен' }, { status: 400 });
    }

    await connectToDatabase();

    if (!mongoose.connection.db) {
      return NextResponse.json({ message: 'Ошибка подключения к базе данных' }, { status: 500 });
    }

    const result = await mongoose.connection.db.collection('recommendations').deleteOne({ characterId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Рекомендации не найдены' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Рекомендации удалены' });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
} 