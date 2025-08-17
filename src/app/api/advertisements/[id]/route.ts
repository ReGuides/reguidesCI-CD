import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AdvertisementModel } from '@/models/Advertisement';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const advertisement = await AdvertisementModel.findById(id).lean();
    
    if (!advertisement) {
      return NextResponse.json(
        { success: false, error: 'Advertisement not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: advertisement 
    });
  } catch (error) {
    console.error('Error fetching advertisement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch advertisement' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const { 
      title, description, cta, url, type, isActive, order, 
      backgroundImage, erid, deviceTargeting, adService, 
      adServiceCode, adServiceId, maxImpressions, startDate, endDate 
    } = body;

    if (!title || !description || !cta || !url || !type || !deviceTargeting) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const advertisement = await AdvertisementModel.findByIdAndUpdate(
      id,
      { 
        title, description, cta, url, type, isActive, order, 
        backgroundImage, erid, deviceTargeting, adService, 
        adServiceCode, adServiceId, maxImpressions,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      },
      { new: true, runValidators: true }
    );

    if (!advertisement) {
      return NextResponse.json(
        { success: false, error: 'Advertisement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: advertisement,
      message: 'Advertisement updated successfully'
    });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update advertisement' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const advertisement = await AdvertisementModel.findByIdAndDelete(id);
    
    if (!advertisement) {
      return NextResponse.json(
        { success: false, error: 'Advertisement not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Advertisement deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete advertisement' },
      { status: 500 }
    );
  }
}
