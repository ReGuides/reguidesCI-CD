#!/bin/bash

# Скрипт для очистки кэша браузера
# Использование: ./clear-cache.sh

echo "🧹 Очищаем кэш браузера..."

# Очищаем кэш Next.js
echo "📁 Очищаем кэш Next.js..."
rm -rf /var/www/reguides/.next/cache
rm -rf /var/www/reguides/node_modules/.cache

# Обновляем время модификации статических файлов
echo "⏰ Обновляем время модификации статических файлов..."
find /var/www/reguides/.next/static -name "*.js" -exec touch {} \;
find /var/www/reguides/.next/static -name "*.css" -exec touch {} \;

# Перезапускаем PM2 для обновления кэша
echo "🔄 Перезапускаем PM2..."
pm2 restart reguides-nextjs

echo "✅ Кэш очищен!"
echo "💡 Теперь обновите страницу в браузере (Ctrl+F5)"
