import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { About } from '@/lib/db/models/About';

export async function GET() {
  try {
    await connectToDatabase();
    
    const about = await About.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    if (!about) {
      return NextResponse.json(
        { error: 'About page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(about);
  } catch (error) {
    console.error('Error fetching about data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 