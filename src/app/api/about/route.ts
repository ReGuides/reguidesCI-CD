import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { About } from '@/lib/db/models/About';
import { User } from '@/lib/db/models/User';
import SiteSettings from '@/models/SiteSettings';

interface AboutData {
  team?: Array<{
    name: string;
    avatar?: string | null;
    role?: string;
    description?: string;
  }>;
  [key: string]: unknown;
}

export async function GET() {
  try {
    await connectToDatabase();
    const about = await About.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean() as AboutData;
    
    if (!about) {
      return NextResponse.json({ error: 'About data not found' }, { status: 404 });
    }

    // Если команда не указана в About, берем из настроек сайта
    if (!about.team || !Array.isArray(about.team) || about.team.length === 0) {
      try {
        const siteSettings = await SiteSettings.getSettings();
        if (siteSettings.team && siteSettings.team.length > 0) {
          about.team = siteSettings.team;
        }
      } catch (error) {
        console.error('Error fetching site settings team:', error);
      }
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