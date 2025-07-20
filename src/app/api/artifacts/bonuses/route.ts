import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ArtifactModel } from '@/models/Artifact';

export async function GET() {
  try {
    await connectDB();
    
    // Получаем все уникальные бонусы
    const bonus1Values = await ArtifactModel.distinct('bonus1');
    const bonus2Values = await ArtifactModel.distinct('bonus2');
    const bonus4Values = await ArtifactModel.distinct('bonus4');
    
    // Объединяем все бонусы и убираем дубликаты
    const allBonuses = [...new Set([
      ...bonus1Values.filter(Boolean),
      ...bonus2Values.filter(Boolean),
      ...bonus4Values.filter(Boolean)
    ])].sort();
    
    return NextResponse.json({
      success: true,
      data: allBonuses
    });
  } catch (error) {
    console.error('Error fetching artifact bonuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artifact bonuses' },
      { status: 500 }
    );
  }
} 