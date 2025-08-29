// Убираем неиспользуемый импорт mongoose
// import mongoose from 'mongoose';

export interface ServerLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  details?: Record<string, unknown>;
  stack?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  userId?: string;
}

// Хранилище логов в памяти (ограничено 1000 записей)
let serverLogs: ServerLogEntry[] = [];

// Счетчик для уникальных ID
let logCounter = 0;

// Функция для добавления лога
export function addServerLog(
  level: ServerLogEntry['level'],
  message: string,
  source: string,
  details?: Record<string, unknown>
): void {
  const logEntry: ServerLogEntry = {
    id: `log_${++logCounter}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    level,
    message,
    source,
    details
  };

  // Добавляем в массив (ограничиваем размер)
  serverLogs.unshift(logEntry);
  if (serverLogs.length > 1000) {
    serverLogs = serverLogs.slice(0, 1000);
  }

  // Выводим в консоль сервера
  const timestamp = new Date().toISOString();
  const levelColor = getLevelColor(level);
  const resetColor = '\x1b[0m';
  
  console.log(
    `${timestamp} [${levelColor}${level.toUpperCase()}${resetColor}] [${source}] ${message}`
  );

  // Если есть детали, выводим их
  if (details && Object.keys(details).length > 0) {
    console.log('  Details:', JSON.stringify(details, null, 2));
  }
}

// Функция для логирования ошибок
export function addServerError(
  error: Error | unknown,
  source: string,
  context?: Record<string, unknown>
): void {
  let message = 'Unknown error';
  // Убираем неиспользуемую переменную stack
  // let stack: string | undefined;
  let details: Record<string, unknown> = {};

  if (error instanceof Error) {
    message = error.message;
    // stack = error.stack;
    details = {
      name: error.name,
      ...context
    };
  } else if (typeof error === 'string') {
    message = error;
    details = context || {};
  } else {
    details = { error, ...context };
  }

  addServerLog('error', message, source, details);
}

// Функция для логирования HTTP запросов
export function addHttpLog(
  method: string,
  url: string,
  statusCode: number,
  source: string,
  details?: Record<string, unknown>
): void {
  const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
  const message = `${method} ${url} - ${statusCode}`;
  
  addServerLog(level, message, source, {
    method,
    url,
    statusCode,
    ...details
  });
}

// Функция для логирования MongoDB операций
export function addMongoLog(
  operation: string,
  collection: string,
  details?: Record<string, unknown>
): void {
  addServerLog('info', `MongoDB: ${operation} on ${collection}`, 'mongodb', details);
}

// Функция для логирования MongoDB ошибок
export function addMongoError(
  error: Error | unknown,
  operation: string,
  collection: string,
  details?: Record<string, unknown>
): void {
  // Убираем неиспользуемую переменную message
  // const message = `MongoDB Error in ${operation} on ${collection}`;
  addServerError(error, 'mongodb', {
    operation,
    collection,
    ...details
  });
}

// Функция для получения логов
export function getServerLogs(
  limit: number = 100,
  level?: ServerLogEntry['level'] | 'all',
  source?: string
): ServerLogEntry[] {
  let filteredLogs = serverLogs;

  // Фильтруем по уровню
  if (level && level !== 'all') {
    filteredLogs = filteredLogs.filter(log => log.level === level);
  }

  // Фильтруем по источнику
  if (source && source !== 'all') {
    filteredLogs = filteredLogs.filter(log => log.source === source);
  }

  // Возвращаем ограниченное количество
  return filteredLogs.slice(0, limit);
}

// Функция для очистки логов
export function clearServerLogs(): void {
  serverLogs = [];
  logCounter = 0;
}

// Функция для получения статистики логов
export function getLogStats(): {
  total: number;
  byLevel: Record<string, number>;
  bySource: Record<string, number>;
  recentErrors: number;
} {
  const byLevel: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  let recentErrors = 0;

  serverLogs.forEach(log => {
    // Подсчет по уровню
    byLevel[log.level] = (byLevel[log.level] || 0) + 1;
    
    // Подсчет по источнику
    bySource[log.source] = (bySource[log.source] || 0) + 1;
    
    // Подсчет недавних ошибок (последние 24 часа)
    if (log.level === 'error') {
      const logTime = new Date(log.timestamp);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (logTime > dayAgo) {
        recentErrors++;
      }
    }
  });

  return {
    total: serverLogs.length,
    byLevel,
    bySource,
    recentErrors
  };
}

// Вспомогательная функция для цветов в консоли
function getLevelColor(level: ServerLogEntry['level']): string {
  switch (level) {
    case 'error': return '\x1b[31m'; // Красный
    case 'warn': return '\x1b[33m';  // Желтый
    case 'info': return '\x1b[36m';  // Голубой
    case 'debug': return '\x1b[35m'; // Пурпурный
    default: return '\x1b[37m';      // Белый
  }
}

// Автоматическое логирование необработанных ошибок
if (typeof process !== 'undefined') {
  process.on('uncaughtException', (error) => {
    addServerError(error, 'uncaught-exception');
  });

  process.on('unhandledRejection', (reason) => {
    addServerError(reason, 'unhandled-rejection');
  });
}
