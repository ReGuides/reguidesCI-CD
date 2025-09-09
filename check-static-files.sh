#!/bin/bash

# Скрипт для проверки статических файлов Next.js
# Использование: ./check-static-files.sh

echo "🔍 Проверяем статические файлы Next.js..."

# Проверяем структуру директорий
echo "📁 Структура .next/static:"
ls -la /var/www/reguides/.next/static/ 2>/dev/null || echo "  Директория не найдена"

echo ""
echo "📁 Структура _next в .next/static:"
ls -la /var/www/reguides/.next/static/_next/ 2>/dev/null || echo "  Директория _next не найдена"

echo ""
echo "📁 Структура chunks:"
ls -la /var/www/reguides/.next/static/chunks/ 2>/dev/null || echo "  Директория chunks не найдена"

echo ""
echo "🌐 Тестируем доступность статических файлов:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://reguides.ru/_next/static/chunks/webpack.js || echo "  Файл недоступен"

echo ""
echo "🔍 Проверяем nginx конфигурацию:"
sudo nginx -t

echo ""
echo "📋 Статус nginx:"
sudo systemctl status nginx --no-pager -l | head -5

echo ""
echo "✅ Проверка завершена"
