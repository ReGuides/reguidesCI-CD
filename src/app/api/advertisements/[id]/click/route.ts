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

    // Увеличиваем счетчик кликов
    const advertisement = await AdvertisementModel.findByIdAndUpdate(
      id,
      {
        $inc: { clicks: 1 }
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
        clicks: advertisement.clicks,
        ctr: advertisement.ctr
      }
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
