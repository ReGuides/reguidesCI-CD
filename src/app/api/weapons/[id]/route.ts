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
    
    const weaponsCollection = mongoose.connection.db.collection('weapons');
    let weapon = await weaponsCollection.findOne({ id });
    
    // Если не найдено по id, попробуем найти по _id
    if (!weapon) {
      try {
        const objectId = new mongoose.Types.ObjectId(id);
        weapon = await weaponsCollection.findOne({ _id: objectId });
      } catch (error) {
        // Если id не является валидным ObjectId, игнорируем ошибку
      }
    }
    
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
      baseAttack: weapon.baseAttack || weapon.base_attack || weapon.attack,
      subStatName: weapon.subStatName || weapon.sub_stat_name || weapon.subStat,
      subStatValue: weapon.subStatValue || weapon.sub_stat_value || weapon.subStatValue,
      passiveName: weapon.passiveName || weapon.passive_name || weapon.passive,
      passiveEffect: weapon.passiveEffect || weapon.passive_effect || weapon.passiveDescription,
      image: weapon.image
    };
    
    console.log('Original weapon data:', weapon);
    console.log('Processed weapon data:', weaponData);
    
    return NextResponse.json(weaponData);
  } catch (error) {
    console.error('Error fetching weapon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weapon' },
      { status: 500 }
    );
  }
} 