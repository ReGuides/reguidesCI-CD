import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { About, IAbout } from '@/lib/db/models/About';
import { User } from '@/lib/db/models/User';
import SiteSettings from '@/models/SiteSettings';
import mongoose from 'mongoose';
// Убираем неиспользуемые импорты
// import { addServerLog, addMongoLog, addServerError } from '@/lib/serverLog';

export async function GET() {
  try {
    await connectToDatabase();
    const about = await About.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean() as IAbout | null;
    
    if (!about) {
      return NextResponse.json({ error: 'About data not found' }, { status: 404 });
    }

    // Всегда берем команду из настроек сайта, даже если в About уже есть команда
    try {
      const siteSettings = await SiteSettings.getSettings();
      if (siteSettings.team && siteSettings.team.length > 0) {
        // Получаем данные пользователей для команды
        const userIds = siteSettings.team.map(member => member.userId);
        
        // Преобразуем строки в ObjectId для корректного поиска
        const objectIds = userIds.map(id => {
          try {
            return new mongoose.Types.ObjectId(id);
          } catch (error) {
            console.error('Invalid ObjectId:', id, error);
            return null;
          }
        }).filter(Boolean);
        
        if (objectIds.length > 0) {
          const users = await User.find({ _id: { $in: objectIds } }).lean();
          
          // Формируем команду с данными пользователей
          const teamMembers = siteSettings.team.map(member => {
            const user = users.find(u => u._id?.toString() === member.userId);
            if (user) {
              return {
                name: user.name || '',
                role: member.role,
                description: member.description,
                avatar: user.avatar || '',
                order: member.order
              };
            }
            return null;
          }).filter((member): member is NonNullable<typeof member> => member !== null);
          
          // Присваиваем команду только если есть валидные участники
          if (teamMembers.length > 0) {
            about.team = teamMembers;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching site settings team:', error);
    }

    // Podtyagivaem avatarki dlya uchastnikov komandy po imeni
    if (about.team && Array.isArray(about.team) && about.team.length > 0) {
      const userNames = about.team.map((t) => t.name);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = await User.find({ name: { $in: userNames } }).lean() as any[];
      about.team = about.team.map((member) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = users.find((u: any) => u.name === member.name);
        return {
          ...member,
          avatar: user?.avatar || member.avatar || null // Prioritize user avatar, then existing member avatar
        };
      });
    }

    return NextResponse.json(about);
  } catch (error) {
    console.error('Error fetching about data:', error);
    return NextResponse.json({ error: 'Failed to fetch about data' }, { status: 500 });
  }
} 