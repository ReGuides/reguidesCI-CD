import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CharacterModel } from '@/models/Character';
import { verifyRequestAuth } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const element = searchParams.get('element');
    const weaponType = searchParams.get('weaponType');
    const rarity = searchParams.get('rarity');
    const region = searchParams.get('region');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    
    // Маппинг синонимов типов оружия
    const weaponSynonyms: { [key: string]: string[] } = {
      'Меч': ['Меч', 'Одноручный меч'],
      'Двуручный меч': ['Двуручный меч'],
      'Копье': ['Копье', 'Копьё'],
      'Лук': ['Лук', 'Стрелковое'],
      'Катализатор': ['Катализатор']
    };

    // Получаем weapon из query
    const weapon = searchParams.get('weapon');
    
    const query: Record<string, unknown> = {};
    
    if (element && element !== 'all') {
      query.element = element;
    }
    
    if (weaponType && weaponType !== 'all') {
      query.weaponType = weaponType;
    }

    if (weapon && weapon !== 'all') {
      // Если выбрано что-то из фильтра, ищем по всем синонимам
      const synonyms = weaponSynonyms[weapon as keyof typeof weaponSynonyms] || [weapon];
      query.weapon = { $in: synonyms };
    }
    
    if (rarity && rarity !== 'all') {
      query.rarity = parseInt(rarity);
    }
    
    if (region && region !== 'all') {
      query.region = region;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    let charactersQuery = CharacterModel.find(query).sort({ name: 1 });
    
    if (limit) {
      charactersQuery = charactersQuery.limit(parseInt(limit));
    }
    
    const characters = await charactersQuery;
    
    // Генерируем фильтры на основе данных
    const allCharacters = await CharacterModel.find({}).sort({ name: 1 });
    // Формируем фильтры с учётом синонимов
    const allWeaponsRaw = allCharacters.map(char => char.weapon).filter(Boolean);
    const weaponGroups = Object.entries(weaponSynonyms).reduce<string[]>((acc, [group, synonyms]) => {
      if (allWeaponsRaw.some(w => synonyms.includes(w))) {
        acc.push(group);
      }
      return acc;
    }, []);
    const filters = {
      elements: [...new Set(allCharacters.map(char => char.element).filter(Boolean))],
      weapons: weaponGroups,
      rarities: [...new Set(allCharacters.map(char => char.rarity).filter(Boolean))],
      regions: Array.from(new Set([...allCharacters.map(char => char.region).filter(Boolean), 'Нод-Край']))
    };
    
    return NextResponse.json({
      success: true,
      data: characters.map(character => ({
        _id: character._id,
        id: character.id,
        name: character.name,
        element: character.element,
        weaponType: character.weaponType,
        rarity: character.rarity,
        region: character.region,
        description: character.description,
        image: character.image,
        isActive: character.isActive,
        isFeatured: character.isFeatured,
        role: character.role,
        weapon: character.weapon,
        patchNumber: character.patchNumber,
        birthday: character.birthday,
        views: character.views,
        createdAt: character.createdAt,
        updatedAt: character.updatedAt
      })),
      filters
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  verifyRequestAuth(request, ['admin']);
  try {
    await connectDB();
    
    const body = await request.json();
    
    const newCharacter = new CharacterModel({
      id: body.id,
      name: body.name,
      element: body.element,
      weaponType: body.weaponType,
      rarity: body.rarity,
      region: body.region,
      description: body.description,
      image: body.image,
      isActive: body.isActive !== undefined ? body.isActive : true,
      isFeatured: body.isFeatured || false,
      role: body.role,
      weapon: body.weapon,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedCharacter = await newCharacter.save();
    
    return NextResponse.json({
      success: true,
      character: savedCharacter
    });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    );
  }
} 