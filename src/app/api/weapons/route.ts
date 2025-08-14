import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const weaponsCollection = mongoose.connection.db.collection('weapons');
    const weapons = await weaponsCollection.find({}).project({
      id: 1,
      name: 1,
      type: 1,
      rarity: 1,
      image: 1
    }).toArray();

    return NextResponse.json({ data: weapons });
  } catch (error) {
    console.error('Error fetching weapons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weapons' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const weaponData = await request.json();
    
    // Валидация обязательных полей
    if (!weaponData.name || !weaponData.id || !weaponData.type || !weaponData.rarity) {
      return NextResponse.json(
        { error: 'Missing required fields: name, id, type, rarity' },
        { status: 400 }
      );
    }

    const weaponsCollection = mongoose.connection.db.collection('weapons');
    
    // Проверяем, не существует ли уже оружие с таким ID
    const existingWeapon = await weaponsCollection.findOne({ id: weaponData.id });
    if (existingWeapon) {
      return NextResponse.json(
        { error: 'Weapon with this ID already exists' },
        { status: 409 }
      );
    }

    // Создаем новое оружие
    const newWeapon = {
      ...weaponData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await weaponsCollection.insertOne(newWeapon);
    
    return NextResponse.json(
      { 
        message: 'Weapon created successfully',
        weaponId: result.insertedId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating weapon:', error);
    return NextResponse.json(
      { error: 'Failed to create weapon' },
      { status: 500 }
    );
  }
} 