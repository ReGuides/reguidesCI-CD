import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { About, IAbout } from '@/lib/db/models/About';
import { User } from '@/lib/db/models/User';
import SiteSettings from '@/models/SiteSettings';
import mongoose from 'mongoose';
// Убираем неиспользуемые импорты
// import { addServerLog, addMongoLog, addServerError } from '@/lib/serverLog';

export async function GET() {
  try {
    await connectDB();
    const about = await About.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean() as IAbout | null;
    
    if (!about) {
      return NextResponse.json({ error: 'About data not found' }, { status: 404 });
    }

    // Всегда берем команду и контакты из настроек сайта
    try {
      const siteSettings = await SiteSettings.getSettings();
      console.log('🔍 SiteSettings team:', siteSettings.team);
      
      // Добавляем контакты из настроек сайта
      if (siteSettings.contacts) {
        about.contactInfo = siteSettings.contacts;
      }
      
      if (siteSettings.team && siteSettings.team.length > 0) {
        // Получаем данные пользователей для команды
        const userIds = siteSettings.team.map(member => member.userId).filter(Boolean);
        console.log('🔍 User IDs from team:', userIds);
        
        if (userIds.length > 0) {
          // Преобразуем строки в ObjectId для корректного поиска
          const objectIds = userIds.map(id => {
            try {
              return new mongoose.Types.ObjectId(id);
            } catch (error) {
              console.error('Invalid ObjectId:', id, error);
              return null;
            }
          }).filter(Boolean);
          
          console.log('🔍 ObjectIds for User search:', objectIds);
          
          if (objectIds.length > 0) {
            const users = await User.find({ _id: { $in: objectIds } }).lean();
            console.log('🔍 Users found:', users.map(u => ({ id: u._id, name: u.name, avatar: u.avatar })));
            
            // Формируем команду с данными пользователей
            const teamMembers = siteSettings.team.map(member => {
              if (member.userId) {
                const user = users.find(u => u._id?.toString() === member.userId);
                console.log(`🔍 Processing member ${member.userId}:`, { user, member });
                if (user) {
                  const result = {
                    name: user.name || '',
                    role: member.role,
                    description: member.description,
                    avatar: user.avatar || '', // Аватар из User
                    order: member.order
                  };
                  console.log(`🔍 Final member data:`, result);
                  return result;
                }
              }
              return null;
            }).filter((member): member is NonNullable<typeof member> => member !== null);
            
            console.log('🔍 Final team members:', teamMembers);
            
            // Присваиваем команду только если есть валидные участники
            if (teamMembers.length > 0) {
              about.team = teamMembers;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching site settings team:', error);
    }

    console.log('🔍 Final about data:', about);
    return NextResponse.json(about);
  } catch (error) {
    console.error('Error fetching about data:', error);
    return NextResponse.json({ error: 'Failed to fetch about data' }, { status: 500 });
  }
} 