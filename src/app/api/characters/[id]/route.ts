import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CharacterModel } from '@/models/Character';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Ищем персонажа только по id
    const character = await CharacterModel.findOne({ id: params.id });
    
    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      _id: character._id,
      id: character.id,
      name: character.name,
      image: character.image,
      element: character.element,
      weapon: character.weapon,
      weaponType: character.weaponType,
      region: character.region,
      rarity: character.rarity,
      gender: character.gender,
      description: character.description,
      birthday: character.birthday,
      patchNumber: character.patchNumber,
      gameplayDescription: character.gameplayDescription,
      isActive: character.isActive,
      isFeatured: character.isFeatured,
      role: character.role,
      views: character.views,
      createdAt: character.createdAt,
      updatedAt: character.updatedAt
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const characterId = params.id;
    
    const updatedCharacter = await CharacterModel.findOneAndUpdate(
      { id: characterId },
      {
        ...body,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedCharacter) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      character: updatedCharacter
    });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const characterId = params.id;
    
    const deletedCharacter = await CharacterModel.findOneAndDelete({ id: characterId });
    
    if (!deletedCharacter) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Character deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json(
      { error: 'Failed to delete character' },
      { status: 500 }
    );
  }
} 