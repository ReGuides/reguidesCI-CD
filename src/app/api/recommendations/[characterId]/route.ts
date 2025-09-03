import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { CharacterModel } from '@/models/Character';
import { Weapon, Artifact, ArtifactOrCombination } from '@/types';

interface RecommendationDocument {
  characterId: string;
  weapons: (string | Record<string, unknown>)[];
  artifacts: (string | ArtifactOrCombination)[];
  notes?: string;
}

interface WeaponDocument {
  _id?: unknown;
  __v?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  id: unknown;
  name: unknown;
  type: unknown;
  rarity: unknown;
  baseAttack: unknown;
  subStatName: unknown;
  subStatValue: unknown;
  passiveName: unknown;
  passiveEffect: unknown;
  image: unknown;
}

interface MainStat {
  stat: string;
  targetValue?: string;
  unit?: string;
  description?: string;
  artifactType?: 'sands' | 'goblet' | 'circlet' | 'general';
}

interface TalentPriority {
  talentName: string;
  priority: number;
  description?: string;
}

interface CharacterStatsDocument {
  characterId: string;
  mainStats?: MainStat[];
  mainStatSands?: string[];
  mainStatGoblet?: string[];
  mainStatCirclet?: string[];
  subStats?: string[];
  talentPriorities?: TalentPriority[];
  notes?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) {
  try {
    await connectDB();
    const { characterId } = await params;

    // Сначала находим персонажа
    const character = await CharacterModel.findOne({
      $or: [
        { id: characterId },
        { name: characterId.replace(/_/g, ' ') }
      ]
    });

    if (!character) {
      return NextResponse.json(
        { message: 'Персонаж не найден' },
        { status: 404 }
      );
    }

    // Получаем рекомендации из коллекции recommendations
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    const recommendationsCollection = mongoose.connection.db.collection('recommendations');
    const recommendation = await recommendationsCollection.findOne({ characterId: character.id }) as RecommendationDocument | null;

    // Получаем статы из коллекции characterstats
    const characterStatsCollection = mongoose.connection.db.collection('characterstats');
    const characterStats = await characterStatsCollection.findOne({ characterId: character.id }) as CharacterStatsDocument | null;

    // Если нет рекомендаций и статов, возвращаем пустой объект вместо 404
    if (!recommendation && !characterStats) {
      return NextResponse.json({
        characterId: character.id,
        weapons: [],
        artifacts: [],
        mainStats: undefined,
        subStats: [],
        talentPriorities: [],
        notes: undefined
      });
    }

    // Получаем полные данные оружий
    console.log('🔧 API Recommendations DEBUG - Original weapons:', recommendation?.weapons);
    const weaponsWithFullData = recommendation ? await Promise.all((recommendation.weapons || []).map(async (weapon: unknown) => {
      // Если оружие уже является объектом с полными данными
      if (typeof weapon === 'object' && weapon !== null && 'name' in weapon) {
        const weaponObj = weapon as WeaponDocument;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, __v, createdAt, updatedAt, ...cleanWeapon } = weaponObj;
        
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
      }
      
      // Если оружие является строкой (ID), ищем в базе данных
      if (typeof weapon === 'string') {
        try {
          // Проверяем подключение к базе данных
          if (mongoose.connection.db) {
            // Ищем оружие в базе данных по ID
            const weaponCollection = mongoose.connection.db.collection('weapons');
            const weaponData = await weaponCollection.findOne({ id: weapon });
            
            if (weaponData) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { _id, __v, createdAt, updatedAt, ...cleanWeapon } = weaponData;
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
            }
          }
        } catch (error) {
          console.error('Error fetching weapon data:', error);
        }
        
        // Если не удалось найти в БД, возвращаем базовый объект
        return { id: weapon, name: weapon } as Weapon;
      }
      
      return { id: 'unknown', name: 'Неизвестное оружие' } as Weapon;
    })) : [];

    // Получаем полные данные артефактов
    const artifactsWithFullData = recommendation ? (recommendation.artifacts || []).map((artifact: unknown) => {
      if (typeof artifact === 'string') {
        // Если это ID артефакта - пока возвращаем базовый объект
        return { id: artifact, name: artifact } as Artifact;
      } else if (typeof artifact === 'object' && artifact !== null) {
        const artifactObj = artifact as Record<string, unknown>;
        // Обрабатываем как объект с полными данными
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, __v, createdAt, updatedAt, ...cleanArtifact } = artifactObj;
        return {
          ...cleanArtifact,
          id: typeof cleanArtifact.id === 'object' ? cleanArtifact.id?.toString() || '' : (cleanArtifact.id?.toString() || ''),
          name: cleanArtifact.name?.toString() || '',
          type: cleanArtifact.type?.toString() || '',
          rarity: Array.isArray(cleanArtifact.rarity) && cleanArtifact.rarity.length > 0
            ? cleanArtifact.rarity.map((r: unknown) => Number(r))
            : [5],
          description: cleanArtifact.description?.toString() || '',
          image: cleanArtifact.image?.toString() || ''
        };
      }
      return artifact;
    }) : [];

    // Обрабатываем статы из characterstats
    let processedMainStats;
    if (characterStats?.mainStats && characterStats.mainStats.length > 0) {
      // Если есть детальные mainStats, используем их
      processedMainStats = {
        detailedStats: characterStats.mainStats,
        sands: characterStats.mainStatSands || [],
        goblet: characterStats.mainStatGoblet || [],
        circlet: characterStats.mainStatCirclet || []
      };
    } else if (characterStats?.mainStatSands || characterStats?.mainStatGoblet || characterStats?.mainStatCirclet) {
      // Если есть только базовые статы артефактов
      processedMainStats = {
        sands: characterStats.mainStatSands || [],
        goblet: characterStats.mainStatGoblet || [],
        circlet: characterStats.mainStatCirclet || []
      };
    }

    // Создаем объект рекомендации с полными данными
    const recommendationWithFullData = {
      characterId: character.id,
      weapons: weaponsWithFullData,
      artifacts: artifactsWithFullData,
      mainStats: processedMainStats,
      subStats: characterStats?.subStats || [],
      talentPriorities: characterStats?.talentPriorities || [],
      notes: characterStats?.notes || recommendation?.notes
    };
    
    console.log('🔧 API Recommendations DEBUG - Final weapons data:', weaponsWithFullData);

    const response = NextResponse.json(recommendationWithFullData);
    
    // Добавляем заголовки для предотвращения кэширования
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
} 