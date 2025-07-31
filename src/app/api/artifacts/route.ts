import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ArtifactModel } from '@/models/Artifact';

export async function GET() {
  try {
    await connectDB();
    
    const artifacts = await ArtifactModel.find({})
      .sort({ name: 1 })
      .lean();

    // Гарантируем, что rarity всегда массив и очищаем от служебных полей
    const safeArtifacts = artifacts.map(a => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, __v, createdAt, updatedAt, ...cleanArtifact } = a;
      // Убеждаемся, что id поле присутствует
      if (!cleanArtifact.id && _id) {
        cleanArtifact.id = _id.toString();
      }
      return {
        ...cleanArtifact,
        rarity: Array.isArray(cleanArtifact.rarity) && cleanArtifact.rarity.length > 0
          ? cleanArtifact.rarity
          : [5]
      };
    });

    // ВРЕМЕННЫЙ ЛОГ ДЛЯ ДИАГНОСТИКИ
    console.log('ArtifactModel.modelName:', ArtifactModel?.modelName);
    console.log('ArtifactModel.schema.obj.rarity:', ArtifactModel?.schema?.obj?.rarity);
    if (artifacts.length > 0) {
      console.log('Пример artifact:', {
        id: artifacts[0].id,
        rarity: artifacts[0].rarity,
        name: artifacts[0].name
      });
    } else {
      console.log('Нет артефактов в базе!');
    }

    return NextResponse.json({ data: safeArtifacts });
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    return NextResponse.json({ error: 'Failed to fetch artifacts' }, { status: 500 });
  }
} 