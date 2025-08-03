import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    
    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const weaponsCollection = mongoose.connection.db.collection('weapons');
    const weapons = await weaponsCollection.find({}).project({
      id: 1,
      name: 1,
      type: 1,
      rarity: 1,
      image: 1
    }).toArray();

    return NextResponse.json({ data: weapons });
  } catch (error) {
    console.error('Error fetching weapons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weapons' },
      { status: 500 }
    );
  }
} 