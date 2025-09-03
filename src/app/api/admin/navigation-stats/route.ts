import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { addServerLog } from '@/lib/serverLog';

// Импортируем модели напрямую
import { CharacterModel } from '@/models/Character';
import { WeaponModel } from '@/models/Weapon';
import { ArtifactModel } from '@/models/Artifact';
import News from '@/models/News';
import { AdvertisementModel } from '@/models/Advertisement';
import { FriendModel } from '@/models/Friend';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Получаем статистику для навигации
    const navigationStats = {
      characters: 0,
      weapons: 0,
      artifacts: 0,
      news: 0,
      users: 0,
      advertisements: 0,
      friends: 0
    };

    try {
      // Статистика персонажей
      navigationStats.characters = await CharacterModel.countDocuments();
    } catch (error) {
      addServerLog('warn', 'navigation-stats', 'Failed to count characters', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    try {
      // Статистика оружия
      navigationStats.weapons = await WeaponModel.countDocuments();
    } catch (error) {
      addServerLog('warn', 'navigation-stats', 'Failed to count weapons', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    try {
      // Статистика артефактов
      navigationStats.artifacts = await ArtifactModel.countDocuments();
    } catch (error) {
      addServerLog('warn', 'navigation-stats', 'Failed to count artifacts', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    try {
      // Статистика новостей
      navigationStats.news = await News.countDocuments();
    } catch (error) {
      addServerLog('warn', 'navigation-stats', 'Failed to count news', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    try {
      // Статистика рекламы (активные)
      navigationStats.advertisements = await AdvertisementModel.countDocuments({ isActive: true });
    } catch (error) {
      addServerLog('warn', 'navigation-stats', 'Failed to count advertisements', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    try {
      // Статистика друзей
      navigationStats.friends = await FriendModel.countDocuments();
    } catch (error) {
      addServerLog('warn', 'navigation-stats', 'Failed to count friends', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Пока что users = 0, так как система пользователей еще не реализована
    navigationStats.users = 0;

    addServerLog('info', 'navigation-stats', 'Navigation statistics retrieved successfully', navigationStats);

    return NextResponse.json({
      success: true,
      data: navigationStats
    });

  } catch (error) {
    console.error('Navigation stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'navigation-stats', 'Error retrieving navigation statistics', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
