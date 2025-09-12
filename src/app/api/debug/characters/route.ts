import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CharacterModel } from '@/models/Character';

export async function GET() {
  try {
    await connectDB();
    
    const characters = await CharacterModel.find({}, { id: 1, name: 1 }).limit(10);
    
    return NextResponse.json({
      count: characters.length,
      characters: characters.map(c => ({ id: c.id, name: c.name }))
    });
  } catch (error) {
    console.error('Debug: Error fetching characters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    );
  }
}
