import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CharacterModel } from '@/models/Character';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const characters = await CharacterModel.find({})
      .select('id name element weaponType rarity')
      .sort({ name: 1 });

    return NextResponse.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
} 