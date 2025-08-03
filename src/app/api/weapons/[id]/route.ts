import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

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
    
    console.log('Searching for weapon with ID:', id);
    
    const weaponsCollection = mongoose.connection.db.collection('weapons');
    const weapon = await weaponsCollection.findOne({ id });
    
    if (!weapon) {
      console.log('Weapon not found for ID:', id);
      return NextResponse.json(
        { error: 'Weapon not found' },
        { status: 404 }
      );
    }
    
    console.log('Found weapon:', weapon);
    console.log('All weapon object keys:', Object.keys(weapon));
    
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
    
    console.log('Returning weapon data:', weaponData);
    
    return NextResponse.json(weaponData);
  } catch (error) {
    console.error('Error fetching weapon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weapon' },
      { status: 500 }
    );
  }
} 