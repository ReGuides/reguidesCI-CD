import { NextRequest, NextResponse } from 'next/server';
import { AdvertisementModel } from '@/models/Advertisement';

export async function GET(request: NextRequest) {
  try {
    // Получаем активную всплывающую рекламу с наивысшим приоритетом
    const advertisement = await AdvertisementModel.findOne({
      type: 'popup',
      isActive: true
    }).sort({ order: 1, createdAt: -1 });

    if (!advertisement) {
      return NextResponse.json({
        success: false,
        message: 'Всплывающая реклама не найдена'
      });
    }

    return NextResponse.json({
      success: true,
      data: advertisement
    });
  } catch (error) {
    console.error('Error fetching popup advertisement:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
