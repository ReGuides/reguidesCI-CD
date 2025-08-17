import { NextResponse } from 'next/server';
import { AdvertisementModel } from '@/models/Advertisement';

export async function GET() {
  try {
    // Получаем активные сайдбарные рекламы с наивысшим приоритетом
    const advertisements = await AdvertisementModel.find({
      type: 'sidebar',
      isActive: true
    }).sort({ order: 1, createdAt: -1 }).limit(3); // Максимум 3 рекламы

    return NextResponse.json({
      success: true,
      data: advertisements
    });
  } catch (error) {
    console.error('Error fetching sidebar advertisements:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
