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

    if (!recommendation && !characterStats) {
      return NextResponse.json(
        { message: 'Рекомендации не найдены' },
        { status: 404 }
      );
    }

    // Получаем полные данные оружий
    const weaponsWithFullData = recommendation ? await Promise.all(
      (recommendation.weapons || []).map(async (weapon: string) => {
        const fullWeaponData = await WeaponModel.findOne({ id: weapon });
        return fullWeaponData || { id: weapon, name: weapon } as Weapon;
      })
    ) : [];

    // Получаем полные данные артефактов
    const artifactsWithFullData = recommendation ? await Promise.all(
      (recommendation.artifacts || []).map(async (artifact: string | ArtifactOrCombination) => {
        if (typeof artifact === 'string') {
          // Если это ID артефакта
          const fullArtifactData = await ArtifactModel.findOne({ id: artifact });
          return fullArtifactData || { id: artifact, name: artifact } as Artifact;
        } else if (artifact.setType === 'single') {
          // Если это одиночный артефакт
          const fullArtifactData = await ArtifactModel.findOne({ id: artifact.id });
          return fullArtifactData || artifact;
        } else if (artifact.setType === 'combination' && 'sets' in artifact) {
          // Если это комбинация артефактов
          const setsWithFullData = await Promise.all(
            (artifact.sets || []).map(async (set: ArtifactSet) => {
              const fullSetData = await ArtifactModel.findOne({ id: set.id });
              return fullSetData || set;
            })
          );
          return {
            ...artifact,
            sets: setsWithFullData
          };
        } else {
          return artifact;
        }
      })
    ) : [];

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