import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ArtifactModel } from '@/models/Artifact';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const artifactsCollection = mongoose.connection.db.collection('artifacts');
    const artifacts = await artifactsCollection.find({}).sort({ name: 1 }).toArray();

    // Гарантируем, что rarity всегда массив и очищаем от служебных полей
    const safeArtifacts = artifacts.map(a => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, __v, createdAt, updatedAt, ...cleanArtifact } = a;
      // Убеждаемся, что id поле присутствует и является строкой
      if (!cleanArtifact.id && _id) {
        cleanArtifact.id = _id.toString();
      }
      // Убеждаемся, что все поля являются примитивами
      return {
        ...cleanArtifact,
        id: typeof cleanArtifact.id === 'object' ? cleanArtifact.id?.toString() || '' : (cleanArtifact.id?.toString() || ''),
        name: cleanArtifact.name?.toString() || '',
        rarity: Array.isArray(cleanArtifact.rarity) && cleanArtifact.rarity.length > 0
          ? cleanArtifact.rarity.map(r => Number(r))
          : [5],
        pieces: Number(cleanArtifact.pieces) || 5,
        bonus1: cleanArtifact.bonus1?.toString() || '',
        bonus2: cleanArtifact.bonus2?.toString() || '',
        bonus4: cleanArtifact.bonus4?.toString() || '',
        image: cleanArtifact.image?.toString() || ''
      };
    });

    return NextResponse.json({ data: safeArtifacts });
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    return NextResponse.json({ error: 'Failed to fetch artifacts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const artifactData = await request.json();
    
    // Валидация обязательных полей
    if (!artifactData.name || !artifactData.id || !artifactData.rarity || !artifactData.pieces) {
      return NextResponse.json(
        { error: 'Missing required fields: name, id, rarity, pieces' },
        { status: 400 }
      );
    }

    // Валидация количества предметов
    const validPieces = [1, 2, 4, 5];
    if (!validPieces.includes(artifactData.pieces)) {
      return NextResponse.json(
        { error: 'Invalid pieces value. Must be 1, 2, 4, or 5' },
        { status: 400 }
      );
    }

    const artifactsCollection = mongoose.connection.db.collection('artifacts');
    
    // Проверяем, не существует ли уже артефакт с таким ID
    const existingArtifact = await artifactsCollection.findOne({ id: artifactData.id });
    if (existingArtifact) {
      return NextResponse.json(
        { error: 'Artifact with this ID already exists' },
        { status: 409 }
      );
    }

    // Создаем новый артефакт
    const newArtifact = {
      ...artifactData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await artifactsCollection.insertOne(newArtifact);
    
    return NextResponse.json(
      { 
        message: 'Artifact created successfully',
        artifactId: result.insertedId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating artifact:', error);
    return NextResponse.json(
      { error: 'Failed to create artifact' },
      { status: 500 }
    );
  }
} 