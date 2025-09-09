#!/bin/bash

# Скрипт для диагностики проблем с nginx и статическими файлами
# Использование: ./debug-nginx.sh

echo "🔍 Диагностика nginx и статических файлов..."

echo "📁 Проверяем структуру .next:"
ls -la /var/www/reguides/.next/ 2>/dev/null || echo "  Директория .next не найдена"

echo ""
echo "📁 Проверяем .next/static:"
ls -la /var/www/reguides/.next/static/ 2>/dev/null || echo "  Директория .next/static не найдена"

echo ""
echo "📁 Проверяем .next/static/_next:"
ls -la /var/www/reguides/.next/static/_next/ 2>/dev/null || echo "  Директория .next/static/_next не найдена"

echo ""
echo "📁 Проверяем .next/static/chunks:"
ls -la /var/www/reguides/.next/static/chunks/ 2>/dev/null || echo "  Директория .next/static/chunks не найдена"

echo ""
echo "📁 Проверяем .next/static/css:"
ls -la /var/www/reguides/.next/static/css/ 2>/dev/null || echo "  Директория .next/static/css не найдена"

echo ""
echo "🌐 Тестируем доступность файлов через nginx:"
curl -s -o /dev/null -w "webpack.js: %{http_code}\n" https://reguides.ru/_next/static/chunks/webpack.js || echo "  webpack.js недоступен"

echo ""
echo "📋 Проверяем конфигурацию nginx:"
sudo nginx -t

echo ""
echo "📄 Показываем текущую конфигурацию nginx:"
sudo cat /etc/nginx/sites-available/reguides | grep -A 10 -B 2 "_next"

echo ""
echo "✅ Диагностика завершена"
