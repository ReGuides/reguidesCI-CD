// Простая утилита для логирования на стороне сервера
export function addServerLog(
  level: 'info' | 'error' | 'warn' | 'debug',
  message: string,
  source: string,
  details?: any
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    source,
    details
  };
  
  // Выводим в консоль сервера
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${source}] ${message}`;
  
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
  
  return logEntry;
}
