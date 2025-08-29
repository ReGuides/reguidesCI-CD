import { NextRequest, NextResponse } from 'next/server';
import { getServerLogs, clearServerLogs, getLogStats } from '@/lib/serverLog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const level = searchParams.get('level') || undefined;
    const source = searchParams.get('source') || undefined;

    const logs = getServerLogs(limit, level as any, source);
    const stats = getLogStats();
    const sources = Object.keys(stats.bySource);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        total: stats.total,
        filtered: logs.length,
        sources,
        stats,
        serverInfo: {
          timestamp: new Date().toISOString(),
          totalLogs: stats.total,
          environment: process.env.NODE_ENV || 'development',
          recentErrors: stats.recentErrors
        }
      }
    });
  } catch (error) {
    console.error('Error getting server logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get server logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'clear') {
      clearServerLogs();
      return NextResponse.json({
        success: true,
        message: 'Server logs cleared successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error clearing server logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear server logs' },
      { status: 500 }
    );
  }
}
