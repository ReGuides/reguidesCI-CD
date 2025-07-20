import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WeaponModel } from '@/models/Weapon';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Получаем все оружия
    const weapons = await WeaponModel.find({}).sort({ name: 1 });
    
    // Проверяем оружия с проблемными изображениями
    const weaponsWithImageIssues = weapons.filter(weapon => {
      return weapon.image && weapon.image.includes('waster-greatsword');
    });
    
    // Получаем несколько примеров оружия для анализа
    const sampleWeapons = weapons.slice(0, 10).map(weapon => ({
      id: weapon.id,
      name: weapon.name,
      type: weapon.type,
      image: weapon.image,
      rarity: weapon.rarity
    }));
    
    return NextResponse.json({
      totalWeapons: weapons.length,
      weaponsWithImageIssues,
      sampleWeapons,
      message: 'Weapon database analysis complete'
    });
  } catch (error) {
    console.error('Error analyzing weapons:', error);
    return NextResponse.json(
      { error: 'Failed to analyze weapons' },
      { status: 500 }
    );
  }
} 