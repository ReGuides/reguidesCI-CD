// Глобальная переменная для хранения логов
let serverLogs: Array<{
  id: string;
  timestamp: string;
  level: 'info' | 'error' | 'warn' | 'debug';
  message: string;
  source: string;
  details?: Record<string, unknown>;
}> = [];

// Функция для добавления логов (будет вызываться из других API endpoints)
export function addServerLog(
  level: 'info' | 'error' | 'warn' | 'debug',
  message: string,
  source: string,
  details?: Record<string, unknown>
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
  
  // Выводим в консоль сервера
  const logMessage = `[${log.timestamp}] [${level.toUpperCase()}] [${source}] ${message}`;
  
  switch (level) {
    case 'error':
      console.error(logMessage, details || '');
      break;
    case 'warn':
      console.warn(logMessage, details || '');
      break;
    case 'debug':
      console.debug(logMessage, details || '');
      break;
    default:
      console.log(logMessage, details || '');
  }
  
  return log;
}

// Функция для получения логов
export function getServerLogs(limit = 100, level = 'all', source = 'all') {
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
  
  return {
    logs: limitedLogs,
    total: serverLogs.length,
    filtered: filteredLogs.length,
    sources,
    serverInfo: {
      timestamp: new Date().toISOString(),
      totalLogs: serverLogs.length,
      environment: process.env.NODE_ENV || 'development'
    }
  };
}

// Функция для очистки логов
export function clearServerLogs() {
  serverLogs = [];
  return { success: true, message: 'Server logs cleared successfully' };
}
