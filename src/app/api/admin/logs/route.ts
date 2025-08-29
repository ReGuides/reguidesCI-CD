import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET - получение логов сервера
export async function GET(request: NextRequest) {
  try {
    // Проверяем, что это админский запрос (можно добавить дополнительную проверку)
    const { searchParams } = new URL(request.url);
    const lines = parseInt(searchParams.get('lines') || '100');
    const level = searchParams.get('level') || 'all'; // all, error, info, warn
    
    // Пути к логам (адаптируйте под вашу систему логирования)
    const logPaths = [
      // Next.js логи
      path.join(process.cwd(), '.next', 'server.log'),
      // MongoDB логи
      path.join(process.cwd(), 'logs', 'mongodb.log'),
      // Общие логи приложения
      path.join(process.cwd(), 'logs', 'app.log'),
      // Системные логи
      path.join(process.cwd(), 'logs', 'system.log')
    ];
    
    const allLogs: Array<{ timestamp: string; level: string; message: string; source: string }> = [];
    
    for (const logPath of logPaths) {
      try {
        if (fs.existsSync(logPath)) {
          const logContent = fs.readFileSync(logPath, 'utf-8');
          const logLines = logContent.split('\n').filter(line => line.trim());
          
          // Парсим логи (адаптируйте под формат ваших логов)
          logLines.forEach(line => {
            try {
              // Простой парсинг логов в формате: [timestamp] [level] message
              const match = line.match(/\[([^\]]+)\]\s*\[([^\]]+)\]\s*(.*)/);
              if (match) {
                const [, timestamp, logLevel, message] = match;
                // Фильтруем по уровню, если указан конкретный уровень
                if (level === 'all' || logLevel.toLowerCase().includes(level.toLowerCase())) {
                  allLogs.push({
                    timestamp,
                    level: logLevel.toLowerCase(),
                    message,
                    source: path.basename(logPath)
                  });
                }
              } else {
                // Если не удалось распарсить, добавляем как есть
                allLogs.push({
                  timestamp: new Date().toISOString(),
                  level: 'info',
                  message: line,
                  source: path.basename(logPath)
                });
              }
            } catch {
              // Игнорируем ошибки парсинга отдельных строк
            }
          });
        }
      } catch (fileError) {
        console.error(`Error reading log file ${logPath}:`, fileError);
      }
    }
    
    // Сортируем по времени (новые сначала)
    allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Ограничиваем количество строк
    const limitedLogs = allLogs.slice(0, lines);
    
    return NextResponse.json({
      success: true,
      data: {
        logs: limitedLogs,
        total: allLogs.length,
        filtered: limitedLogs.length,
        sources: logPaths.map(p => path.basename(p))
      }
    });
    
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

// POST - очистка логов
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'clear') {
      // Очищаем логи (осторожно!)
      const logPaths = [
        path.join(process.cwd(), '.next', 'server.log'),
        path.join(process.cwd(), 'logs', 'mongodb.log'),
        path.join(process.cwd(), 'logs', 'app.log'),
        path.join(process.cwd(), 'logs', 'system.log')
      ];
      
      for (const logPath of logPaths) {
        try {
          if (fs.existsSync(logPath)) {
            fs.writeFileSync(logPath, '');
          }
        } catch (fileError) {
          console.error(`Error clearing log file ${logPath}:`, fileError);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Logs cleared successfully'
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error clearing logs:', error);
    return NextResponse.json(
      { error: 'Failed to clear logs' },
      { status: 500 }
    );
  }
}
