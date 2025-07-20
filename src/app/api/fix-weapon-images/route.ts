import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WeaponModel } from '@/models/Weapon';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ищем оружие с проблемными изображениями
    const weaponsWithIssues = await WeaponModel.find({
      $or: [
        { image: 'waster-greatsword.webp' },
        { image: { $regex: 'waster-greatsword', $options: 'i' } }
      ]
    });
    
    // Получаем все оружия для анализа
    const allWeapons = await WeaponModel.find({}).sort({ name: 1 });
    
    // Анализируем изображения
    const imageAnalysis = allWeapons.map(weapon => ({
      id: weapon.id,
      name: weapon.name,
      image: weapon.image,
      hasImage: !!weapon.image,
      imageStartsWithSlash: weapon.image?.startsWith('/'),
      imageStartsWithHttp: weapon.image?.startsWith('http')
    }));
    
    return NextResponse.json({
      weaponsWithIssues,
      totalWeapons: allWeapons.length,
      imageAnalysis: imageAnalysis.slice(0, 10), // Первые 10 для анализа
      message: 'Weapon image analysis complete'
    });
  } catch (error) {
    console.error('Error analyzing weapon images:', error);
    return NextResponse.json(
      { error: 'Failed to analyze weapon images' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Исправляем проблемные изображения
    const result = await WeaponModel.updateMany(
      { image: 'waster-greatsword.webp' },
      { $set: { image: '/images/weapons/default.png' } }
    );
    
    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: 'Fixed weapon images'
    });
  } catch (error) {
    console.error('Error fixing weapon images:', error);
    return NextResponse.json(
      { error: 'Failed to fix weapon images' },
      { status: 500 }
    );
  }
} 