// Централизованная конфигурация для монолитного Next.js проекта
// При деплое измените эти значения на продакшен

export const config = {
  // База данных
  database: {
    // Для разработки
    development: 'mongodb://localhost:27017/reguides',
    // Для продакшена - измените на ваш хост
    production: 'mongodb://reguides.ru:27017/reguides',
  },
  
  // Приложение (Next.js монолит)
  app: {
    // Для разработки
    development: 'http://localhost:3000',
    // Для продакшена - измените на ваш домен
    production: 'https://reguides.ru',
  }
};

// Функции для получения конфигурации
export const getDatabaseURI = () => {
  return process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? config.database.production : config.database.development);
};

export const getAppURL = () => {
  // Автоматически определяем окружение
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? config.app.production : config.app.development;
}; 