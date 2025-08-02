import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { CharacterModel } from '@/models/Character';
import { WeaponModel } from '@/models/Weapon';
import { ArtifactModel } from '@/models/Artifact';
import { Weapon, Artifact, ArtifactOrCombination } from '@/types';

interface RecommendationDocument {
  characterId: string;
  weapons: string[];
  artifacts: (string | ArtifactOrCombination)[];
  notes?: string;
}

interface CharacterStatsDocument {
  characterId: string;
  mainStatSands?: string[];
  mainStatGoblet?: string[];
  mainStatCirclet?: string[];
  subStats?: string[];
  notes?: string;
}

interface ArtifactSet {
  id: string;
  name: string;
  image?: string;
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
        notes: undefined
      });
    }

         // Получаем полные данные оружий
     const weaponsWithFullData = recommendation ? (recommendation.weapons || []).map((weapon: any) => {
       // Если оружие уже является объектом с полными данными
       if (typeof weapon === 'object' && weapon !== null && 'name' in weapon) {
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const { _id, __v, createdAt, updatedAt, ...cleanWeapon } = weapon;
         
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
         // Здесь можно добавить поиск по базе данных, если нужно
         return { id: weapon, name: weapon } as Weapon;
       }
       
       return { id: 'unknown', name: 'Неизвестное оружие' } as Weapon;
     }) : [];

         // Получаем полные данные артефактов
     const artifactsWithFullData = recommendation ? (recommendation.artifacts || []).map((artifact: any) => {
       if (typeof artifact === 'string') {
         // Если это ID артефакта - пока возвращаем базовый объект
         // В будущем можно добавить поиск по базе данных, если нужно
         return { id: artifact, name: artifact } as Artifact;
       } else if (artifact.setType === 'single') {
         // Если это одиночный артефакт с полными данными
         if (typeof artifact === 'object' && artifact !== null && 'name' in artifact) {
           // eslint-disable-next-line @typescript-eslint/no-unused-vars
           const { _id, __v, createdAt, updatedAt, ...cleanArtifact } = artifact;
           // Убеждаемся, что все поля являются примитивами
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
       } else if (artifact.setType === 'combination' && 'sets' in artifact) {
         // Если это комбинация артефактов
         const setsWithFullData = (artifact.sets || []).map((set: any) => {
           if (typeof set === 'object' && set !== null && 'name' in set) {
             // eslint-disable-next-line @typescript-eslint/no-unused-vars
             const { _id, __v, createdAt, updatedAt, ...cleanSet } = set;
             // Убеждаемся, что все поля являются примитивами
             return {
               ...cleanSet,
               id: typeof cleanSet.id === 'object' ? cleanSet.id?.toString() || '' : (cleanSet.id?.toString() || ''),
               name: cleanSet.name?.toString() || '',
               type: cleanSet.type?.toString() || '',
               rarity: Array.isArray(cleanSet.rarity) && cleanSet.rarity.length > 0
                 ? cleanSet.rarity.map((r: unknown) => Number(r))
                 : [5],
               description: cleanSet.description?.toString() || '',
               image: cleanSet.image?.toString() || ''
             };
           }
           return set;
         });
         return {
           ...artifact,
           sets: setsWithFullData
         };
       } else {
         return artifact;
       }
     }) : [];

         // Создаем объект рекомендации с полными данными
     const recommendationWithFullData = {
      characterId: character.id,
      weapons: weaponsWithFullData,
      artifacts: artifactsWithFullData,
      // Добавляем статы из characterstats
      mainStats: characterStats ? {
        sands: characterStats.mainStatSands?.[0] || '',
        goblet: characterStats.mainStatGoblet?.[0] || '',
        circlet: characterStats.mainStatCirclet?.[0] || ''
      } : undefined,
      subStats: characterStats?.subStats || [],
      notes: characterStats?.notes || recommendation?.notes
    };

    return NextResponse.json(recommendationWithFullData);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
} 