import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { User } from '@/lib/db/models/User';
import mongoose from 'mongoose';
import { addServerLog } from '@/lib/serverLog';

// GET - получение команды разработчиков с данными пользователей
export async function GET() {
  try {
    await connectToDatabase();
    console.log('Team GET - Connected to database');
    
    console.log('Team GET - SiteSettings model:', SiteSettings);
    console.log('Team GET - SiteSettings.getSettings:', SiteSettings.getSettings);
    
    const settings = await SiteSettings.getSettings();
    console.log('Team GET - SiteSettings:', settings);
    
    if (!settings.team || settings.team.length === 0) {
      console.log('Team GET - No team found, returning empty array');
      return NextResponse.json({ 
        success: true, 
        data: [] 
      });
    }

    // Получаем данные пользователей для команды
    const userIds = settings.team.map(member => member.userId);
    console.log('Team GET - User IDs:', userIds);
    
    // Преобразуем строки в ObjectId для корректного поиска
    const objectIds = userIds.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (error) {
        console.error('Invalid ObjectId:', id, error);
        return null;
      }
    }).filter(Boolean);
    
    console.log('Team GET - ObjectIds:', objectIds);
    
    if (objectIds.length === 0) {
      console.log('Team GET - No valid ObjectIds found');
      return NextResponse.json({ 
        success: true, 
        data: [] 
      });
    }
    
    const users = await User.find({ _id: { $in: objectIds } }).lean();
    console.log('Team GET - Found users:', users.map(u => ({ id: u._id, name: u.name })));
    
    // Объединяем данные пользователей с ролями и описаниями
    const teamWithUsers = settings.team.map(member => {
      const user = users.find(u => u._id?.toString() === member.userId);
      return {
        ...member,
        user: user ? {
          _id: user._id?.toString() || '',
          name: user.name || '',
          avatar: user.avatar || '',
          email: user.email || ''
        } : null
      };
    });

    console.log('Team GET - Final team data:', teamWithUsers);

    return NextResponse.json({ 
      success: true, 
      data: teamWithUsers 
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

// PUT - обновление команды разработчиков
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    addServerLog('info', 'Team PUT - Connected to database', 'team-api');
    
    const body = await request.json();
    const { team } = body;
    
    addServerLog('info', 'Team PUT - Received team data', 'team-api', { 
      teamCount: team?.length || 0,
      teamData: team 
    });
    
    if (!Array.isArray(team)) {
      addServerLog('error', 'Team PUT - Invalid team data, not an array', 'team-api');
      return NextResponse.json(
        { error: 'Team must be an array' },
        { status: 400 }
      );
    }
    
    // Получаем текущие настройки
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      addServerLog('info', 'Team PUT - Creating new SiteSettings', 'team-api');
      // Создаем новые настройки, если их нет
      settings = new SiteSettings({ team });
    } else {
      addServerLog('info', 'Team PUT - Updating existing SiteSettings', 'team-api');
      // Обновляем команду
      settings.team = team;
    }
    
    // Сохраняем настройки
    await settings.save();
    addServerLog('info', 'Team PUT - Settings saved successfully', 'team-api');
    
    return NextResponse.json({ 
      success: true, 
      data: settings.team,
      message: 'Команда успешно обновлена'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    addServerLog('error', 'Team PUT - Error occurred', 'team-api', { 
      error: errorMessage, 
      stack: errorStack 
    });
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}
