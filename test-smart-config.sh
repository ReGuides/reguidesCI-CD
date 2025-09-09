#!/bin/bash

# Тестирование умной конфигурации nginx
# Использование: ./test-smart-config.sh

echo "🧪 Тестирование умной конфигурации nginx..."

# Проверяем статус PM2
echo "📋 Статус PM2:"
pm2 list | grep reguides-nextjs

echo ""
echo "🌐 Тестируем доступность сайта:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost/ || echo "  Сайт недоступен"

echo ""
echo "🔍 Тестируем health check:"
curl -s http://localhost/health || echo "  Health check недоступен"

echo ""
echo "📄 Проверяем конфигурацию nginx:"
sudo nginx -t

echo ""
echo "📋 Статус nginx:"
sudo systemctl status nginx --no-pager -l | head -5

echo ""
echo "✅ Тест завершен"
