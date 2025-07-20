import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WeaponModel } from '@/models/Weapon';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Получаем первые 5 оружий для отладки
    const weapons = await WeaponModel.find({}).limit(5);
    
    const debugData = weapons.map(weapon => ({
      id: weapon.id,
      name: weapon.name,
      image: weapon.image,
      type: weapon.type,
      rarity: weapon.rarity
    }));
    
    return NextResponse.json({
      success: true,
      debug: debugData,
      total: await WeaponModel.countDocuments()
    });
  } catch (error) {
    console.error('Error fetching weapons debug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weapons debug' },
      { status: 500 }
    );
  }
} 