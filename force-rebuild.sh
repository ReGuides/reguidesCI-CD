#!/bin/bash

# Скрипт для принудительной пересборки и очистки кэша
# Использование: ./force-rebuild.sh

echo "🔄 Принудительная пересборка и очистка кэша..."

# Останавливаем PM2
echo "🛑 Останавливаем PM2..."
pm2 stop reguides-nextjs

# Очищаем все кэши
echo "🧹 Очищаем кэши..."
rm -rf /var/www/reguides/.next
rm -rf /var/www/reguides/node_modules/.cache
rm -rf /var/www/reguides/.next/cache

# Очищаем кэш браузера для статических файлов
echo "⏰ Обновляем время модификации файлов..."
find /var/www/reguides/.next/static -name "*.js" -exec touch {} \; 2>/dev/null || true
find /var/www/reguides/.next/static -name "*.css" -exec touch {} \; 2>/dev/null || true

# Перезапускаем PM2
echo "🚀 Перезапускаем PM2..."
pm2 start ecosystem.config.js --env production

# Ждем запуска
echo "⏳ Ждем запуска..."
sleep 5

# Проверяем статус
echo "📋 Статус PM2:"
pm2 list | grep reguides-nextjs

echo "✅ Пересборка завершена!"
echo "💡 Обновите страницу в браузере (Ctrl+F5)"
