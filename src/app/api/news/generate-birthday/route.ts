import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import News, { INewsModel } from '@/models/News';
import { CharacterModel as Character } from '@/models/Character';
import { isBirthdayToday } from '@/lib/utils/dateUtils';

// POST - генерация новостей о днях рождения
export async function POST() {
  try {
    await connectDB();
    
    const today = new Date();
    
    // Находим всех персонажей и фильтруем по дню рождения
    const allCharacters = await Character.find({}).select('_id id name birthday image');
    const charactersWithBirthday = allCharacters.filter(char => 
      char.birthday && isBirthdayToday(char.birthday)
    );

    if (charactersWithBirthday.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No characters have birthdays today',
        generated: 0
      });
    }

    let generatedCount = 0;
    const results = [];

    for (const character of charactersWithBirthday) {
      // Проверяем, не создана ли уже новость для этого персонажа сегодня
      const existingNews = await (News as INewsModel).hasBirthdayNews(character._id.toString(), today);
      
      if (!existingNews) {
        try {
          const birthdayNews = await (News as INewsModel).createBirthdayNews(
            character._id.toString(),
            character.name,
            character.id,
            character.image
          );
          
          results.push({
            character: character.name,
            newsId: birthdayNews._id,
            status: 'created'
          });
          
          generatedCount++;
        } catch (error) {
          console.error(`Error creating birthday news for ${character.name}:`, error);
          results.push({
            character: character.name,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      } else {
        results.push({
          character: character.name,
          status: 'already_exists'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${generatedCount} birthday news`,
      generated: generatedCount,
      total: charactersWithBirthday.length,
      results
    });

  } catch (error) {
    console.error('Error generating birthday news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate birthday news' },
      { status: 500 }
    );
  }
}

// GET - проверка персонажей с днем рождения сегодня
export async function GET() {
  try {
    await connectDB();
    
    const today = new Date();
    
    // Находим всех персонажей и фильтруем по дню рождения
    const allCharacters = await Character.find({}).select('name birthday image');
    const charactersWithBirthday = allCharacters.filter(char => 
      char.birthday && isBirthdayToday(char.birthday)
    );

    // Проверяем, какие новости уже созданы
    const existingNews = await News.find({
      type: 'birthday',
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    }).select('characterId');

    const existingCharacterIds = existingNews.map(n => n.characterId?.toString());

    const result = charactersWithBirthday.map(character => ({
      ...character,
      hasNews: existingCharacterIds.includes(character._id.toString())
    }));

    return NextResponse.json({
      success: true,
      data: {
        today: today.toISOString().split('T')[0],
        characters: result,
        total: result.length,
        withNews: result.filter(c => c.hasNews).length,
        withoutNews: result.filter(c => !c.hasNews).length
      }
    });

  } catch (error) {
    console.error('Error checking birthday characters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check birthday characters' },
      { status: 500 }
    );
  }
}
