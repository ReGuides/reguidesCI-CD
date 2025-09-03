import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { WeaponModel } from '@/models/Weapon';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectToDatabase();
    
    if (!WeaponModel) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Weapon ID is required' },
        { status: 400 }
      );
    }

    const weaponsCollection = WeaponModel.collection;
    
    // Ищем оружие по ID
    const weapon = await weaponsCollection.findOne({ id: id });
    
    if (!weapon) {
      return NextResponse.json(
        { error: 'Weapon not found' },
        { status: 404 }
      );
    }

    // Возвращаем все данные оружия
    return NextResponse.json({
      success: true,
      weapon: weapon
    });
  } catch (error) {
    console.error('Error fetching weapon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weapon' },
      { status: 500 }
    );
  }
}
