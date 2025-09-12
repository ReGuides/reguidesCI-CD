import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CharacterModel } from '@/models/Character';
import { verifyRequestAuth } from '@/lib/utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Ищем персонажа только по id
    const character = await CharacterModel.findOne({ id });
    
    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }
    
    // Убеждаемся, что id поле присутствует
    const characterData = {
      _id: character._id,
      id: character.id || character._id?.toString(),
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
    };
    
    return NextResponse.json(characterData);
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
  { params }: { params: Promise<{ id: string }> }
) {
  verifyRequestAuth(request, ['admin']);
  try {
    await connectDB();
    
    const body = await request.json();
    const { id: characterId } = await params;
    
    // Фильтруем только валидные поля для обновления
    const validFields = [
      'name', 'image', 'element', 'weapon', 'weaponType', 'region', 'rarity', 
      'gender', 'description', 'birthday', 'patchNumber', 'gameplayDescription', 
      'views', 'isActive', 'isFeatured', 'role'
    ];
    
    const updateData: any = {};
    for (const field of validFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    // Если есть weaponType, сохраняем его как weapon
    if (body.weaponType) {
      updateData.weapon = body.weaponType;
    }
    
    console.log('API: Filtered update data:', updateData);
    
    const updatedCharacter = await CharacterModel.findOneAndUpdate(
      { id: characterId },
      {
        ...updateData,
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
  { params }: { params: Promise<{ id: string }> }
) {
  verifyRequestAuth(request, ['admin']);
  try {
    await connectDB();
    
    const { id: characterId } = await params;
    
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