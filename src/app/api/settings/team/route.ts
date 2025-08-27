import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import SiteSettings from '@/models/SiteSettings';

// GET - получение команды разработчиков
export async function GET() {
  try {
    await connectToDatabase();
    
    const settings = await SiteSettings.getSettings();
    
    return NextResponse.json({ 
      success: true, 
      data: settings.team || [] 
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
