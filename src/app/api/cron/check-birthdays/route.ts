import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import News, { INewsModel } from '@/models/News';
import { CharacterModel as Character } from '@/models/Character';
import { isBirthdayToday } from '@/lib/utils/dateUtils';

// GET - проверка и создание новостей о днях рождения
export async function GET() {
  try {
    await connectDB();
    
    const today = new Date();
    console.log('🎂 Cron job: Checking birthdays for', today.toISOString().split('T')[0]);
    
    // Находим всех персонажей и фильтруем по дню рождения
    const allCharacters = await Character.find({}).select('_id name birthday image');
    const charactersWithBirthday = allCharacters.filter(char => 
      char.birthday && isBirthdayToday(char.birthday)
    );

    if (charactersWithBirthday.length === 0) {
      console.log('🎂 Cron job: No birthdays today');
      return NextResponse.json({
        success: true,
        message: 'No characters have birthdays today',
        generated: 0,
        checked: allCharacters.length
      });
    }

    console.log(`🎂 Cron job: Found ${charactersWithBirthday.length} characters with birthdays today:`, 
      charactersWithBirthday.map(c => c.name));

    let generatedCount = 0;
    const results = [];

    for (const character of charactersWithBirthday) {
      try {
        // Проверяем, не создана ли уже новость для этого персонажа сегодня
        const existingNews = await (News as INewsModel).hasBirthdayNews(character._id.toString(), today);
        
        if (!existingNews) {
          console.log(`🎂 Cron job: Creating birthday news for ${character.name}`);
          
          const birthdayNews = await (News as INewsModel).createBirthdayNews(
            character._id.toString(),
            character.name,
            character.image
          );
          
          results.push({
            character: character.name,
            newsId: birthdayNews._id,
            status: 'created'
          });
          
          generatedCount++;
          console.log(`✅ Cron job: Successfully created birthday news for ${character.name}`);
        } else {
          console.log(`🎂 Cron job: Birthday news already exists for ${character.name}`);
          results.push({
            character: character.name,
            status: 'already_exists'
          });
        }
      } catch (error) {
        console.error(`❌ Cron job: Error creating birthday news for ${character.name}:`, error);
        results.push({
          character: character.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`🎂 Cron job: Completed. Generated ${generatedCount} news out of ${charactersWithBirthday.length} characters`);

    return NextResponse.json({
      success: true,
      message: `Cron job completed. Generated ${generatedCount} birthday news`,
      generated: generatedCount,
      total: charactersWithBirthday.length,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cron job: Error checking birthdays:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check birthdays',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST - принудительная проверка (для тестирования)
export async function POST() {
  return GET();
}
