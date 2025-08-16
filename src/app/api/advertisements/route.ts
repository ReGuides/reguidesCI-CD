import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AdvertisementModel } from '@/models/Advertisement';

export async function GET() {
  try {
    await connectDB();

    const advertisements = await AdvertisementModel.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: advertisements
    });
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch advertisements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, description, cta, url, type, isActive, order, backgroundImage, erid } = body;

    // Валидация обязательных полей
    if (!title || !description || !cta || !url || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Создаем новую рекламу
    const advertisement = new AdvertisementModel({
      title,
      description,
      cta,
      url,
      type,
      isActive: isActive ?? true,
      order: order ?? 0,
      backgroundImage,
      erid
    });

    await advertisement.save();

    return NextResponse.json({
      success: true,
      data: advertisement,
      message: 'Advertisement created successfully'
    });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create advertisement' },
      { status: 500 }
    );
  }
}
