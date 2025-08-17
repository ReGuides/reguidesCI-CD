import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AdvertisementModel } from '@/models/Advertisement';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    const { id } = await params;

    // Увеличиваем счетчик показов и обновляем время последнего показа
    const advertisement = await AdvertisementModel.findByIdAndUpdate(
      id,
      {
        $inc: { impressions: 1 },
        $set: { lastShown: new Date() }
      },
      { new: true }
    );

    if (!advertisement) {
      return NextResponse.json(
        { success: false, error: 'Advertisement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        impressions: advertisement.impressions,
        lastShown: advertisement.lastShown
      }
    });
  } catch (error) {
    console.error('Error tracking impression:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track impression' },
      { status: 500 }
    );
  }
}
