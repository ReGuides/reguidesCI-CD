import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { addServerLog } from '@/lib/serverLog';

// Импортируем модели напрямую
import { CharacterModel } from '@/models/Character';
import { WeaponModel } from '@/models/Weapon';
import { ArtifactModel } from '@/models/Artifact';
import News from '@/models/News';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Получаем статистику контента напрямую из базы данных
    const contentStats = {
      characters: 0,
      weapons: 0,
      artifacts: 0,
      news: 0,
      builds: 0
    };

    try {
      // Статистика персонажей
      contentStats.characters = await CharacterModel.countDocuments();
    } catch (error) {
      addServerLog('warn', 'content-stats', 'Failed to count characters', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    try {
      // Статистика оружия
      contentStats.weapons = await WeaponModel.countDocuments();
    } catch (error) {
      addServerLog('warn', 'content-stats', 'Failed to count weapons', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    try {
      // Статистика артефактов
      contentStats.artifacts = await ArtifactModel.countDocuments();
    } catch (error) {
      addServerLog('warn', 'content-stats', 'Failed to count artifacts', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    try {
      // Статистика новостей
      contentStats.news = await News.countDocuments();
    } catch (error) {
      addServerLog('warn', 'content-stats', 'Failed to count news', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Пока что builds = 0, так как система сборок еще не реализована
    contentStats.builds = 0;

    addServerLog('info', 'content-stats', 'Content statistics retrieved successfully', contentStats);

    return NextResponse.json({
      success: true,
      data: contentStats
    });

  } catch (error) {
    console.error('Content stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'content-stats', 'Error retrieving content statistics', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
