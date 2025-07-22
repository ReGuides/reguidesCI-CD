import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { About } from '@/lib/db/models/About';
import { User } from '@/lib/db/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    
    const about = await About.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean();
    
    if (!about) {
      return NextResponse.json(
        { error: 'About page not found' },
        { status: 404 }
      );
    }

    // Подтягиваем аватарки для участников команды по имени
    if (about.team && about.team.length > 0) {
      const userNames = about.team.map((t: any) => t.name);
      const users = await User.find({ name: { $in: userNames } }).lean();
      about.team = about.team.map((member: any) => {
        const user = users.find((u: any) => u.name === member.name);
        return {
          ...member,
          avatar: user?.avatar || member.avatar || null
        };
      });
    }

    return NextResponse.json(about);
  } catch (error) {
    console.error('Error fetching about data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 