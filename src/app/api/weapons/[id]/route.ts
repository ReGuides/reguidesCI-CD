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
    const weapon = await weaponsCollection.findOne({ id: id });

    if (!weapon) {
      return NextResponse.json(
        { error: 'Weapon not found' },
        { status: 404 }
      );
    }

    // Убираем служебные поля MongoDB
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...cleanWeapon } = weapon;

    const response = NextResponse.json(cleanWeapon);
    
    // Добавляем заголовки для предотвращения кэширования
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching weapon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weapon' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const weaponData = await request.json();
    console.log('Получены данные для обновления оружия:', weaponData);
    
    // Валидация обязательных полей
    if (!weaponData.name || !weaponData.type || !weaponData.rarity) {
      console.log('Ошибка валидации: отсутствуют обязательные поля');
      return NextResponse.json(
        { error: 'Missing required fields: name, type, rarity' },
        { status: 400 }
      );
    }

    const weaponsCollection = WeaponModel.collection;
    
    // Обновляем оружие
    const updateData = {
      ...weaponData,
      updatedAt: new Date()
    };
    
    console.log('Данные для обновления в БД:', updateData);

    const result = await weaponsCollection.findOneAndUpdate(
      { id: id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    console.log('Результат обновления в БД:', result);

    if (!result) {
      return NextResponse.json(
        { error: 'Weapon not found' },
        { status: 404 }
      );
    }

    // Убираем служебные поля MongoDB
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...cleanWeapon } = result;

    const response = NextResponse.json(cleanWeapon);
    
    // Добавляем заголовки для предотвращения кэширования
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error updating weapon:', error);
    return NextResponse.json(
      { error: 'Failed to update weapon' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    const result = await weaponsCollection.deleteOne({ id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Weapon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Weapon deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting weapon:', error);
    return NextResponse.json(
      { error: 'Failed to delete weapon' },
      { status: 500 }
    );
  }
}