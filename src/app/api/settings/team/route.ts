import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { User } from '@/lib/db/models/User';

// GET - получение команды разработчиков с данными пользователей
export async function GET() {
  try {
    await connectToDatabase();
    
    const settings = await SiteSettings.getSettings();
    
    if (!settings.team || settings.team.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [] 
      });
    }

    // Получаем данные пользователей для команды
    const userIds = settings.team.map(member => member.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    
    // Объединяем данные пользователей с ролями и описаниями
    const teamWithUsers = settings.team.map(member => {
      const user = users.find(u => u._id.toString() === member.userId);
      return {
        ...member,
        user: user ? {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          email: user.email
        } : null
      };
    });

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
    
    const body = await request.json();
    const { team } = body;
    
    if (!Array.isArray(team)) {
      return NextResponse.json(
        { error: 'Team must be an array' },
        { status: 400 }
      );
    }
    
    // Получаем текущие настройки
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      // Создаем новые настройки, если их нет
      settings = new SiteSettings({ team });
    } else {
      // Обновляем команду
      settings.team = team;
    }
    
    // Сохраняем настройки
    await settings.save();
    
    return NextResponse.json({ 
      success: true, 
      data: settings.team,
      message: 'Команда успешно обновлена'
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}
