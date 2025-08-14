import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// GET - получить оружие по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { id } = await params;
    const weaponsCollection = mongoose.connection.db.collection('weapons');
    const weapon = await weaponsCollection.findOne({ id });

    if (!weapon) {
      return NextResponse.json(
        { error: 'Weapon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: weapon });
  } catch (error) {
    console.error('Error fetching weapon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weapon' },
      { status: 500 }
    );
  }
}

// PUT - обновить оружие
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { id } = await params;
    const weaponData = await request.json();
    
    // Валидация обязательных полей
    if (!weaponData.name || !weaponData.type || !weaponData.rarity) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, rarity' },
        { status: 400 }
      );
    }

    const weaponsCollection = mongoose.connection.db.collection('weapons');
    
    // Проверяем, существует ли оружие
    const existingWeapon = await weaponsCollection.findOne({ id });
    if (!existingWeapon) {
      return NextResponse.json(
        { error: 'Weapon not found' },
        { status: 404 }
      );
    }

    // Обновляем оружие
    const updatedWeapon = {
      ...weaponData,
      updatedAt: new Date()
    };

    const result = await weaponsCollection.updateOne(
      { id },
      { $set: updatedWeapon }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Weapon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Weapon updated successfully',
      weaponId: id
    });
  } catch (error) {
    console.error('Error updating weapon:', error);
    return NextResponse.json(
      { error: 'Failed to update weapon' },
      { status: 500 }
    );
  }
}

// DELETE - удалить оружие
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { id } = await params;
    const weaponsCollection = mongoose.connection.db.collection('weapons');
    
    const result = await weaponsCollection.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Weapon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Weapon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting weapon:', error);
    return NextResponse.json(
      { error: 'Failed to delete weapon' },
      { status: 500 }
    );
  }
} 