import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectToDatabase();
    
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Artifact ID is required' },
        { status: 400 }
      );
    }

    const artifactsCollection = mongoose.connection.db.collection('artifacts');
    // Ищем артефакт сначала по ID, затем по имени
    let artifact = await artifactsCollection.findOne({ id: id });
    
    if (!artifact) {
      // Если не найден по ID, ищем по имени
      artifact = await artifactsCollection.findOne({ name: id });
    }

    if (!artifact) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }

    // Убираем служебные поля MongoDB и очищаем данные
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, createdAt, updatedAt, ...cleanArtifact } = artifact;
    
    // Убеждаемся, что все поля являются примитивами
    const safeArtifact = {
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

    return NextResponse.json(safeArtifact);
  } catch (error) {
    console.error('Error fetching artifact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artifact' },
      { status: 500 }
    );
  }
}