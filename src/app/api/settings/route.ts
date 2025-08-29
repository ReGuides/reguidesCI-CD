import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import SiteSettings from '@/models/SiteSettings';

// GET - получение настроек сайта
export async function GET() {
  try {
    await connectToDatabase();
    
    const settings = await SiteSettings.getSettings();
    console.log('SiteSettings GET response:', settings);
    
    return NextResponse.json({ 
      success: true, 
      data: settings 
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

// PUT - обновление настроек сайта
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Получаем текущие настройки
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      // Создаем новые настройки, если их нет
      settings = new SiteSettings(body);
    } else {
      // Обновляем существующие настройки
      Object.assign(settings, body);
    }
    
    // Сохраняем настройки
    await settings.save();
    
    return NextResponse.json({ 
      success: true, 
      data: settings,
      message: 'Настройки успешно обновлены'
    });
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { error: 'Failed to update site settings' },
      { status: 500 }
    );
  }
}
