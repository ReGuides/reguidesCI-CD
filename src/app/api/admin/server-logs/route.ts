import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getServerLogs, clearServerLogs } from '@/lib/serverLog';

// GET - получение логов сервера
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const level = searchParams.get('level') || 'all';
    const source = searchParams.get('source') || 'all';
    
    const result = getServerLogs(limit, level, source);
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error fetching server logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server logs' },
      { status: 500 }
    );
  }
}

// POST - очистка логов
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'clear') {
      const result = clearServerLogs();
      return NextResponse.json(result);
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error clearing server logs:', error);
    return NextResponse.json(
      { error: 'Failed to clear server logs' },
      { status: 500 }
    );
  }
}
