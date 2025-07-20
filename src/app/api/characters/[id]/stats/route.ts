import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CharacterStatsModel } from '@/models/CharacterStats';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: characterId } = await params;
    const stats = await CharacterStatsModel.findOne({ characterId });
    
    if (!stats) {
      return NextResponse.json({
        characterId,
        mainStats: [],
        mainStatSands: [],
        mainStatGoblet: [],
        mainStatCirclet: [],
        subStats: [],
        talentPriorities: [],
        notes: ''
      });
    }
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching character stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character stats' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: characterId } = await params;
    const body = await request.json();
    
    const statsData = {
      characterId,
      mainStats: body.mainStats || [],
      mainStatSands: body.mainStatSands || [],
      mainStatGoblet: body.mainStatGoblet || [],
      mainStatCirclet: body.mainStatCirclet || [],
      subStats: body.subStats || [],
      talentPriorities: body.talentPriorities || [],
      notes: body.notes || ''
    };
    
    const stats = await CharacterStatsModel.findOneAndUpdate(
      { characterId },
      statsData,
      { new: true, upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error saving character stats:', error);
    return NextResponse.json(
      { error: 'Failed to save character stats' },
      { status: 500 }
    );
  }
} 