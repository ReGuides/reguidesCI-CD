import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WeaponModel } from '@/models/Weapon';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Получаем параметры фильтрации
    const { searchParams } = new URL(request.url);
    const filter: Record<string, unknown> = {};
    const type = searchParams.get('type');
    const rarity = searchParams.get('rarity');
    const search = searchParams.get('search');

    if (type && type !== 'all') filter.type = type;
    if (rarity && rarity !== 'all') filter.rarity = Number(rarity);
    if (search) filter.name = { $regex: search, $options: 'i' };

    const weapons = await WeaponModel.find(filter)
      .sort({ name: 1 })
      .lean();

    // Собираем уникальные типы и редкости для фильтров
    const allWeapons = await WeaponModel.find({}).select('type rarity').lean();
    const types = Array.from(new Set(allWeapons.map(w => w.type))).filter(Boolean);
    const rarities = Array.from(new Set(allWeapons.map(w => w.rarity))).filter(Boolean).sort((a, b) => b - a);

    // Очищаем данные от служебных полей MongoDB
    const cleanWeapons = weapons.map(weapon => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, __v, createdAt, updatedAt, ...cleanWeapon } = weapon;
      // Убеждаемся, что id поле присутствует и является строкой
      if (!cleanWeapon.id && _id) {
        cleanWeapon.id = _id.toString();
      }
      // Убеждаемся, что все поля являются примитивами
      return {
        ...cleanWeapon,
                     id: typeof cleanWeapon.id === 'object' ? cleanWeapon.id?.toString() || '' : (cleanWeapon.id?.toString() || ''),
        name: cleanWeapon.name?.toString() || '',
        type: cleanWeapon.type?.toString() || '',
        rarity: Number(cleanWeapon.rarity) || 1,
        baseAttack: cleanWeapon.baseAttack?.toString() || '',
        subStatName: cleanWeapon.subStatName?.toString() || '',
        subStatValue: cleanWeapon.subStatValue?.toString() || '',
        passiveName: cleanWeapon.passiveName?.toString() || '',
        passiveEffect: cleanWeapon.passiveEffect?.toString() || '',
        image: cleanWeapon.image?.toString() || ''
      };
    });

    return NextResponse.json({
      data: cleanWeapons,
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