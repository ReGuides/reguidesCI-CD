import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WeaponModel } from '@/models/Weapon';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const weapon = await WeaponModel.findOne({ id });
    
    if (!weapon) {
      return NextResponse.json(
        { error: 'Weapon not found' },
        { status: 404 }
      );
    }
    
    // Убеждаемся, что id поле присутствует
    const weaponData = {
      id: weapon.id || weapon._id?.toString(),
      name: weapon.name,
      type: weapon.type,
      rarity: weapon.rarity,
      baseAttack: weapon.baseAttack,
      subStatName: weapon.subStatName,
      subStatValue: weapon.subStatValue,
      passiveName: weapon.passiveName,
      passiveEffect: weapon.passiveEffect,
      image: weapon.image
    };
    
    return NextResponse.json(weaponData);
  } catch (error) {
    console.error('Error fetching weapon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weapon' },
      { status: 500 }
    );
  }
} 