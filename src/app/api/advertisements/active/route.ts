import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AdvertisementModel } from '@/models/Advertisement';

export async function GET() {
  try {
    await connectDB();
    
    const advertisements = await AdvertisementModel.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    
    return NextResponse.json(advertisements);
  } catch (error) {
    console.error('Error fetching active advertisements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advertisements' },
      { status: 500 }
    );
  }
} 