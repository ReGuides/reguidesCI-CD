import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { About } from '@/lib/db/models/About';
import { User } from '@/lib/db/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    const about = await About.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean() as any;
    
    if (!about) {
      return NextResponse.json({ error: 'About data not found' }, { status: 404 });
    }

    // Podtyagivaem avatarki dlya uchastnikov komandy po imeni
    if (about.team && Array.isArray(about.team) && about.team.length > 0) {
      const userNames = about.team.map((t: any) => t.name);
      const users = await User.find({ name: { $in: userNames } }).lean();
      about.team = about.team.map((member: any) => {
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