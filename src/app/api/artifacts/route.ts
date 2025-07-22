import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ArtifactModel } from '@/models/Artifact';

export async function GET() {
  try {
    await connectDB();
    
    const artifacts = await ArtifactModel.find({})
      .select('id name rarity image')
      .sort({ name: 1 });

    // Гарантируем, что rarity всегда массив
    const safeArtifacts = artifacts.map(a => ({
      ...a.toObject(),
      rarity: Array.isArray(a.rarity) && a.rarity.length > 0
        ? a.rarity
        : [5]
    }));

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