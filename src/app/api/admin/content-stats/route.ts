import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { addServerLog } from '@/lib/serverLog';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Получаем статистику контента
    const contentStats = {
      characters: 0,
      weapons: 0,
      artifacts: 0,
      articles: 0,
      builds: 0
    };

    try {
      // Статистика персонажей
      const charactersResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/characters`);
      if (charactersResponse.ok) {
        const charactersData = await charactersResponse.json();
        if (charactersData.success) {
          contentStats.characters = charactersData.data.length;
        }
      }
    } catch (error) {
      addServerLog('warn', 'content-stats', 'Failed to fetch characters stats', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    try {
      // Статистика оружия
      const weaponsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/weapons`);
      if (weaponsResponse.ok) {
        const weaponsData = await weaponsResponse.json();
        if (weaponsData.success) {
          contentStats.weapons = weaponsData.data.length;
        }
      }
    } catch (error) {
      addServerLog('warn', 'content-stats', 'Failed to fetch weapons stats', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    try {
      // Статистика артефактов
      const artifactsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/artifacts`);
      if (artifactsResponse.ok) {
        const artifactsData = await artifactsResponse.json();
        if (artifactsData.success) {
          contentStats.artifacts = artifactsData.data.length;
        }
      }
    } catch (error) {
      addServerLog('warn', 'content-stats', 'Failed to fetch artifacts stats', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    try {
      // Статистика статей
      const articlesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/articles`);
      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        if (articlesData.success) {
          contentStats.articles = articlesData.data.length;
        }
      }
    } catch (error) {
      addServerLog('warn', 'content-stats', 'Failed to fetch articles stats', { error: error instanceof Error ? error.message : 'Unknown error' });
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
