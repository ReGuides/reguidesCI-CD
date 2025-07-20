// Утилита для безопасной передачи данных между Server и Client компонентами

export function sanitizeData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(sanitizeData) as T;
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Error) {
        sanitized[key] = value.message;
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized as T;
  }

  return data;
}

export function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(sanitizeData(obj));
  } catch {
    return JSON.stringify({ error: 'Failed to serialize data' });
  }
} 