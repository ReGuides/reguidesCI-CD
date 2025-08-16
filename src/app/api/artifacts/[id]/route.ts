import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { id } = await params;
    const artifactsCollection = mongoose.connection.db.collection('artifacts');
    
    const artifact = await artifactsCollection.findOne({ id });
    
    if (!artifact) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }

    // Очищаем от служебных полей MongoDB
    const { ...cleanArtifact } = artifact;
    
    return NextResponse.json({ data: cleanArtifact });
  } catch (error) {
    console.error('Error fetching artifact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artifact' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { id } = await params;
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
    
    // Проверяем, существует ли артефакт
    const existingArtifact = await artifactsCollection.findOne({ id });
    if (!existingArtifact) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }

    // Обновляем артефакт
    const updateData = {
      ...artifactData,
      updatedAt: new Date()
    };

    const result = await artifactsCollection.updateOne(
      { id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        message: 'Artifact updated successfully',
        artifactId: id 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating artifact:', error);
    return NextResponse.json(
      { error: 'Failed to update artifact' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { id } = await params;
    const artifactsCollection = mongoose.connection.db.collection('artifacts');
    
    // Проверяем, существует ли артефакт
    const existingArtifact = await artifactsCollection.findOne({ id });
    if (!existingArtifact) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }

    // Удаляем артефакт
    const result = await artifactsCollection.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        message: 'Artifact deleted successfully',
        artifactId: id 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting artifact:', error);
    return NextResponse.json(
      { error: 'Failed to delete artifact' },
      { status: 500 }
    );
  }
} 