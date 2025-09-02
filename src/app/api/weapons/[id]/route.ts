import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { WeaponModel } from '@/models/Weapon';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    if (!WeaponModel) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const weaponId = params.id;
    
    if (!weaponId) {
      return NextResponse.json(
        { error: 'Weapon ID is required' },
        { status: 400 }
      );
    }

    const weaponsCollection = WeaponModel.collection;
    const weapon = await weaponsCollection.findOne({ id: weaponId });

    if (!weapon) {
      return NextResponse.json(
        { error: 'Weapon not found' },
        { status: 404 }
      );
    }

    // Убираем служебные поля MongoDB
    const { _id, __v, ...cleanWeapon } = weapon;

    return NextResponse.json(cleanWeapon);
  } catch (error) {
    console.error('Error fetching weapon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weapon' },
      { status: 500 }
    );
  }
}