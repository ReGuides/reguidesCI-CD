import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WeaponModel } from '@/models/Weapon';

export async function GET() {
  try {
    await connectDB();
    
    const weapons = await WeaponModel.find({})
      .select('id name type rarity image')
      .sort({ name: 1 });

    return NextResponse.json({ data: weapons });
  } catch (error) {
    console.error('Error fetching weapons:', error);
    return NextResponse.json({ error: 'Failed to fetch weapons' }, { status: 500 });
  }
} 