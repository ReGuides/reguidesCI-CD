// Утилита для безопасной обработки ошибок

export function safeErrorHandler(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
}

export function logError(context: string, error: unknown): void {
  const errorMessage = safeErrorHandler(error);
  console.error(`${context}:`, errorMessage);
} 