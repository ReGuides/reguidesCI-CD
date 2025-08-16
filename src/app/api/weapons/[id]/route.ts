import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { WeaponModel } from '@/models/Weapon';

// GET - получить оружие по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const weapon = await WeaponModel.findOne({ id });

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
    await connectToDatabase();
    
    const { id } = await params;
    const weaponData = await request.json();
    
    // Валидация обязательных полей
    if (!weaponData.name || !weaponData.type || !weaponData.rarity) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, rarity' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли оружие
    const existingWeapon = await WeaponModel.findOne({ id });
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

    const result = await WeaponModel.updateOne(
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
    await connectToDatabase();
    
    const { id } = await params;
    
    const result = await WeaponModel.deleteOne({ id });
    
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