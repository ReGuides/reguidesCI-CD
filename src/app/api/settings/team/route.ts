import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { User } from '@/lib/db/models/User';
import mongoose from 'mongoose';
import { addServerLog, addMongoLog, addServerError } from '@/lib/serverLog';

// GET - получение команды разработчиков с данными пользователей
export async function GET() {
  try {
    await connectToDatabase();
    addServerLog('info', 'Team GET - Connected to database', 'team-api');
    
    addServerLog('info', 'Team GET - SiteSettings model loaded', 'team-api', { model: 'SiteSettings' });
    addServerLog('info', 'Team GET - SiteSettings.getSettings method available', 'team-api', { method: 'getSettings' });
    
    const settings = await SiteSettings.getSettings();
    addServerLog('info', 'Team GET - SiteSettings retrieved', 'team-api', { settings });
    
    if (!settings.team || settings.team.length === 0) {
      addServerLog('info', 'Team GET - No team found, returning empty array', 'team-api');
      return NextResponse.json({ 
        success: true, 
        data: [] 
      });
    }

    addServerLog('info', `Processing ${settings.team.length} team members`, 'team-api', {
      teamCount: settings.team.length
    });

    // Получаем данные пользователей для команды
    const userIds = settings.team.map(member => member.userId);
    addServerLog('info', 'Team GET - User IDs extracted', 'team-api', { userIds });
    
    // Преобразуем строки в ObjectId для корректного поиска
    const objectIds = userIds.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (error) {
        addServerLog('warn', 'Invalid ObjectId format', 'team-api', { id, error: error instanceof Error ? error.message : 'Unknown error' });
        return null;
      }
    }).filter(Boolean);
    
    addServerLog('info', 'Team GET - ObjectIds converted', 'team-api', { objectIds });
    
    if (objectIds.length === 0) {
      addServerLog('warn', 'No valid ObjectIds found', 'team-api');
      return NextResponse.json({ 
        success: true, 
        data: [] 
      });
    }
    
    const users = await User.find({ _id: { $in: objectIds } }).lean();
    addMongoLog('find', 'User', { count: users.length, userIds });
    addServerLog('info', 'Team GET - Users found', 'team-api', { 
      users: users.map(u => ({ id: u._id, name: u.name })) 
    });
    
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

    addServerLog('info', 'Team GET - Final team data prepared', 'team-api', { teamWithUsers });

    addServerLog('info', 'Team members retrieved successfully', 'team-api', {
      processed: teamWithUsers.length,
      total: settings.team.length
    });

    return NextResponse.json({ 
      success: true, 
      data: teamWithUsers 
    });
  } catch (error) {
    addServerError(error, 'team-api', { action: 'get_team_settings' });
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
    addServerLog('info', 'Team settings update requested', 'team-api');
    
    await connectToDatabase();
    addMongoLog('connect', 'database', { endpoint: 'team-settings-update' });
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

    // Валидация каждого участника команды
    for (let i = 0; i < team.length; i++) {
      const member = team[i];
      
      addServerLog('info', `Validating team member at index ${i}`, 'team-api', { 
        member, 
        memberType: typeof member,
        hasRole: !!member.role,
        roleType: typeof member.role,
        roleValue: member.role,
        hasUserId: !!member.userId,
        userIdType: typeof member.userId,
        userIdValue: member.userId
      });
      
      // Проверяем новую структуру (с userId)
      if (member.userId) {
        if (typeof member.userId !== 'string' || member.userId.trim() === '') {
          addServerLog('error', `Team PUT - Invalid member at index ${i}: missing or empty userId`, 'team-api', { member, index: i });
          return NextResponse.json(
            { error: `Team member at index ${i}: userId is required and cannot be empty` },
            { status: 400 }
          );
        }
      }
      
      // Проверяем старую структуру (с name) - для обратной совместимости
      if (member.name && !member.userId) {
        addServerLog('warn', `Team PUT - Member at index ${i} uses old structure (name instead of userId)`, 'team-api', { member, index: i });
        // Пропускаем валидацию userId для старой структуры
      }
      
      if (!member.role || typeof member.role !== 'string' || member.role.trim() === '') {
        addServerLog('error', `Team PUT - Invalid member at index ${i}: missing or empty role`, 'team-api', { member, index: i });
        return NextResponse.json(
          { error: `Team member at index ${i}: role is required and cannot be empty` },
          { status: 400 }
        );
      }
      
      addServerLog('info', `Team member at index ${i} validation passed`, 'team-api', { member, index: i });
    }

    addServerLog('info', 'Team PUT - Team data validation passed', 'team-api', { teamCount: team.length });
    
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
    addMongoLog('save', 'SiteSettings', { action: 'team_update', teamCount: team.length });
    addServerLog('info', 'Team PUT - Settings saved successfully', 'team-api');
    
    addServerLog('info', 'Team settings updated successfully', 'team-api', {
      finalTeamCount: team.length
    });
    
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
    addServerError(error, 'team-api', { action: 'update_team_settings' });
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}
