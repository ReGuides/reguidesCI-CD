import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CharacterRecommendationModel, ICharacterRecommendation } from '@/models/CharacterRecommendation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const recommendations = await CharacterRecommendationModel.find({ characterId: id });
    
    return NextResponse.json({
      recommendations: recommendations.map((rec: ICharacterRecommendation) => ({
        weapons: rec.weapons || [],
        artifacts: rec.artifacts || [],
        mainStats: {
          sands: rec.mainStatSands?.[0] || '',
          goblet: rec.mainStatGoblet?.[0] || '',
          circlet: rec.mainStatCirclet?.[0] || ''
        },
        subStats: rec.subStats || [],
        notes: rec.notes
      }))
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
} 