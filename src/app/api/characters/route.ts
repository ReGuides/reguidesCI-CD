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
    
    const characters = await charactersQuery.lean();
    
    // Генерируем фильтры на основе данных
    const allCharacters = await CharacterModel.find({}).sort({ name: 1 }).lean();
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
      data: characters.map(character => {
        const { _id: _unused1, __v: _unused2, createdAt: _unused3, updatedAt: _unused4, ...cleanCharacter } = character;
        return cleanCharacter;
      }),
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
  try {
    console.log('POST /api/characters - Starting request');
    
    // Проверяем аутентификацию
    const user = verifyRequestAuth(request, ['admin']);
    console.log('POST /api/characters - Auth successful for user:', user);
    
    await connectDB();
    console.log('POST /api/characters - Database connected');
    
    const body = await request.json();
    console.log('POST /api/characters - Request body:', body);
    
    // Проверяем обязательные поля
    if (!body.id || !body.name) {
      console.error('POST /api/characters - Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: id and name' },
        { status: 400 }
      );
    }
    
    // Проверяем, не существует ли уже персонаж с таким ID
    const existingCharacter = await CharacterModel.findOne({ id: body.id });
    if (existingCharacter) {
      console.error('POST /api/characters - Character with this ID already exists:', body.id);
      return NextResponse.json(
        { error: 'Character with this ID already exists' },
        { status: 409 }
      );
    }
    
    const characterData = {
      id: body.id,
      name: body.name,
      element: body.element,
      weaponType: body.weaponType,
      rarity: body.rarity,
      region: body.region,
      description: body.description,
      image: body.image,
      gender: body.gender,
      birthday: body.birthday,
      patchNumber: body.patchNumber,
      gameplayDescription: body.gameplayDescription || '',
      role: body.role,
      isActive: body.isActive !== undefined ? body.isActive : true,
      isFeatured: body.isFeatured || false,
      weapon: body.weapon,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('POST /api/characters - Creating character with data:', characterData);
    
    const newCharacter = new CharacterModel(characterData);
    const savedCharacter = await newCharacter.save();
    
    console.log('POST /api/characters - Character saved successfully:', savedCharacter._id);
    
    return NextResponse.json({
      success: true,
      character: savedCharacter
    });
  } catch (error) {
    console.error('POST /api/characters - Error creating character:', error);
    
    // Более подробная информация об ошибке
    if (error instanceof Error) {
      console.error('POST /api/characters - Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to create character', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 