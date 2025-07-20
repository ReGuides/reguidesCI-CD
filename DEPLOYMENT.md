# Инструкция по деплою

## Подготовка к деплою

### 1. Конфигурация базы данных

Перед деплоем измените настройки в файле `src/lib/config.ts`:

```typescript
export const config = {
  database: {
    development: 'mongodb://localhost:27017/reguides',
    // Измените на ваш продакшен хост
    production: 'mongodb://your-production-host:27017/reguides',
  },
  app: {
    development: 'http://localhost:3000',
    // Измените на ваш домен
    production: 'https://your-domain.com',
  }
};
```

### 2. Функции конфигурации

В файле `src/lib/config.ts` есть функции для получения настроек. При необходимости измените логику определения окружения:

```typescript
export const getDatabaseURI = () => {
  // Добавьте логику определения окружения
  // Например: return process.env.NODE_ENV === 'production' ? config.database.production : config.database.development;
  return config.database.development;
};
```

### 3. Сборка проекта

```bash
npm run build
```

### 4. Запуск в продакшене

```bash
npm start
```

## Важные моменты

- Все настройки централизованы в `src/lib/config.ts`
- Нет зависимостей от .env файлов
- Легко изменить настройки для деплоя
- MongoDB подключение настроено для разных окружений
- **Монолитный Next.js проект** - клиент и сервер работают на одном порту

## Структура конфигурации

- `database` - настройки базы данных
- `app` - настройки приложения (Next.js монолит)

При деплое просто измените значения в `config` объекте на продакшен версии. 