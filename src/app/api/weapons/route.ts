import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WeaponModel } from '@/models/Weapon';

export async function GET(request) {
  try {
    await connectDB();

    // Получаем параметры фильтрации
    const { searchParams } = new URL(request.url);
    const filter = {};
    const type = searchParams.get('type');
    const rarity = searchParams.get('rarity');
    const search = searchParams.get('search');

    if (type && type !== 'all') filter.type = type;
    if (rarity && rarity !== 'all') filter.rarity = Number(rarity);
    if (search) filter.name = { $regex: search, $options: 'i' };

    const weapons = await WeaponModel.find(filter)
      .select('id name type rarity image')
      .sort({ name: 1 });

    // Собираем уникальные типы и редкости для фильтров
    const allWeapons = await WeaponModel.find({}).select('type rarity');
    const types = Array.from(new Set(allWeapons.map(w => w.type))).filter(Boolean);
    const rarities = Array.from(new Set(allWeapons.map(w => w.rarity))).filter(Boolean).sort((a, b) => b - a);

    return NextResponse.json({
      data: weapons,
      filters: {
        types,
        rarities
      }
    });
  } catch (error) {
    console.error('Error fetching weapons:', error);
    return NextResponse.json({ error: 'Failed to fetch weapons' }, { status: 500 });
  }
} 