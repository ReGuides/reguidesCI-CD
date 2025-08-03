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
    
    console.log('Searching for weapon with ID:', id);
    
    let weapon = await WeaponModel.findOne({ id });
    
    // Если не найден по id, попробуем найти по _id
    if (!weapon) {
      console.log('Weapon not found by id, trying _id');
      weapon = await WeaponModel.findById(id);
    }
    
    if (!weapon) {
      console.log('Weapon not found for ID:', id);
      return NextResponse.json(
        { error: 'Weapon not found' },
        { status: 404 }
      );
    }
    
    console.log('Found weapon:', weapon);
    console.log('Weapon fields from DB:', {
      id: weapon.id,
      _id: weapon._id,
      name: weapon.name,
      type: weapon.type,
      rarity: weapon.rarity,
      baseAttack: weapon.baseAttack,
      subStatName: weapon.subStatName,
      subStatValue: weapon.subStatValue,
      passiveName: weapon.passiveName,
      passiveEffect: weapon.passiveEffect,
      image: weapon.image
    });
    
    // Проверяем, какие поля существуют
    console.log('Weapon hasOwnProperty checks:', {
      hasId: weapon.hasOwnProperty('id'),
      hasName: weapon.hasOwnProperty('name'),
      hasType: weapon.hasOwnProperty('type'),
      hasRarity: weapon.hasOwnProperty('rarity'),
      hasBaseAttack: weapon.hasOwnProperty('baseAttack'),
      hasSubStatName: weapon.hasOwnProperty('subStatName'),
      hasSubStatValue: weapon.hasOwnProperty('subStatValue'),
      hasPassiveName: weapon.hasOwnProperty('passiveName'),
      hasPassiveEffect: weapon.hasOwnProperty('passiveEffect'),
      hasImage: weapon.hasOwnProperty('image')
    });
    
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
    console.log('Weapon data fields:', {
      id: weaponData.id,
      name: weaponData.name,
      type: weaponData.type,
      rarity: weaponData.rarity,
      baseAttack: weaponData.baseAttack,
      subStatName: weaponData.subStatName,
      subStatValue: weaponData.subStatValue,
      passiveName: weaponData.passiveName,
      passiveEffect: weaponData.passiveEffect,
      image: weaponData.image
    });
    
    return NextResponse.json(weaponData);
  } catch (error) {
    console.error('Error fetching weapon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weapon' },
      { status: 500 }
    );
  }
} 