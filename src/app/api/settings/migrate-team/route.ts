import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { About, IAbout } from '@/lib/db/models/About';
import SiteSettings from '@/models/SiteSettings';

export async function POST() {
  try {
    await connectToDatabase();
    
    // Получаем команду из About
    const about = await About.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean() as IAbout | null;
    
    if (!about || !about.team || !Array.isArray(about.team) || about.team.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Команда не найдена в About или пуста' 
      });
    }
    
    // Получаем или создаем настройки сайта
    let siteSettings = await SiteSettings.findOne();
    if (!siteSettings) {
      siteSettings = new SiteSettings({});
    }
    
    // Копируем команду из About в SiteSettings
    siteSettings.team = about.team.map((member, index) => ({
      name: member.name,
      role: member.role || 'Участник команды',
      description: member.description || '',
      avatar: member.avatar || '',
      social: member.social || {},
      order: index
    }));
    
    // Сохраняем настройки
    await siteSettings.save();
    
    return NextResponse.json({ 
      success: true, 
      message: `Команда успешно мигрирована. Перенесено ${siteSettings.team.length} участников.`,
      data: siteSettings.team
    });
  } catch (error) {
    console.error('Error migrating team:', error);
    return NextResponse.json(
      { error: 'Failed to migrate team' },
      { status: 500 }
    );
  }
}
