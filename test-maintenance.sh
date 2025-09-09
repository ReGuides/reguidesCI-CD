#!/bin/bash

# Тестовый скрипт для проверки режима обслуживания
# Использование: ./test-maintenance.sh

echo "🧪 Тестирование режима обслуживания..."

# Проверяем текущий статус
echo "📋 Текущий статус nginx:"
sudo systemctl status nginx --no-pager -l | head -10

echo ""
echo "📄 Текущая конфигурация nginx:"
sudo cat /etc/nginx/sites-available/reguides 2>/dev/null || echo "  Конфигурация не найдена"

echo ""
echo "🔍 Доступные backup файлы:"
ls -la /etc/nginx/sites-available/reguides.backup.* 2>/dev/null || echo "  Нет backup файлов"

echo ""
echo "🌐 Тестируем доступность сайта:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost/ || echo "  Сайт недоступен"

echo ""
echo "✅ Тест завершен"
