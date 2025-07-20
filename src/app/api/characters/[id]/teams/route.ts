import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CharacterTeamsModel } from '@/models/CharacterTeams';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: characterId } = await params;
    const teams = await CharacterTeamsModel.findOne({ characterId });
    
    if (!teams) {
      return NextResponse.json({
        characterId,
        recommendedTeams: [],
        compatibleCharacters: [],
        notes: ''
      });
    }
    
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching character teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character teams' },
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
    
    const teamsData = {
      characterId,
      recommendedTeams: body.recommendedTeams || [],
      compatibleCharacters: body.compatibleCharacters || [],
      notes: body.notes || ''
    };
    
    const teams = await CharacterTeamsModel.findOneAndUpdate(
      { characterId },
      teamsData,
      { new: true, upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      teams
    });
  } catch (error) {
    console.error('Error saving character teams:', error);
    return NextResponse.json(
      { error: 'Failed to save character teams' },
      { status: 500 }
    );
  }
} 