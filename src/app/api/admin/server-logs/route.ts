import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Глобальная переменная для хранения логов
let serverLogs: Array<{
  id: string;
  timestamp: string;
  level: 'info' | 'error' | 'warn' | 'debug';
  message: string;
  source: string;
  details?: any;
}> = [];

// Функция для добавления логов (будет вызываться из других API endpoints)
export function addServerLog(
  level: 'info' | 'error' | 'warn' | 'debug',
  message: string,
  source: string,
  details?: any
) {
  const log = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    level,
    message,
    source,
    details
  };
  
  serverLogs.unshift(log); // Добавляем в начало
  
  // Ограничиваем количество логов (храним последние 1000)
  if (serverLogs.length > 1000) {
    serverLogs = serverLogs.slice(0, 1000);
  }
  
  return log;
}

// GET - получение логов сервера
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const level = searchParams.get('level') || 'all';
    const source = searchParams.get('source') || 'all';
    
    let filteredLogs = [...serverLogs];
    
    // Фильтруем по уровню
    if (level !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    // Фильтруем по источнику
    if (source !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.source === source);
    }
    
    // Ограничиваем количество
    const limitedLogs = filteredLogs.slice(0, limit);
    
    // Получаем уникальные источники
    const sources = [...new Set(serverLogs.map(log => log.source))];
    
    return NextResponse.json({
      success: true,
      data: {
        logs: limitedLogs,
        total: serverLogs.length,
        filtered: filteredLogs.length,
        sources,
        serverInfo: {
          timestamp: new Date().toISOString(),
          totalLogs: serverLogs.length,
          environment: process.env.NODE_ENV || 'development'
        }
      }
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
      serverLogs = [];
      return NextResponse.json({
        success: true,
        message: 'Server logs cleared successfully'
      });
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
