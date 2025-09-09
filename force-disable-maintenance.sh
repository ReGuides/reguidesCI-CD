#!/bin/bash

# Срочный скрипт для принудительного отключения режима обслуживания
# Использование: ./force-disable-maintenance.sh

echo "🚨 ПРИНУДИТЕЛЬНОЕ ОТКЛЮЧЕНИЕ РЕЖИМА ОБСЛУЖИВАНИЯ"

# Останавливаем nginx
echo "🛑 Останавливаем nginx..."
sudo systemctl stop nginx

# Удаляем все backup файлы конфигурации
echo "🗑️ Удаляем все backup файлы..."
sudo rm -f /etc/nginx/sites-available/reguides.backup.*

# Создаем правильную конфигурацию
echo "🔧 Создаем правильную конфигурацию nginx..."
sudo tee /etc/nginx/sites-available/reguides > /dev/null << 'EOF'
server {
    listen 80;
    server_name reguides.ru www.reguides.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Проверяем, что конфигурация включена
echo "🔗 Проверяем символическую ссылку..."
if [ ! -L /etc/nginx/sites-enabled/reguides ]; then
    echo "🔗 Создаем символическую ссылку..."
    sudo ln -sf /etc/nginx/sites-available/reguides /etc/nginx/sites-enabled/reguides
fi

# Удаляем default конфигурацию если есть
sudo rm -f /etc/nginx/sites-enabled/default

# Тестируем конфигурацию
echo "🧪 Тестируем конфигурацию..."
if sudo nginx -t; then
    echo "✅ Конфигурация корректна"
    
    # Запускаем nginx
    echo "🚀 Запускаем nginx..."
    sudo systemctl start nginx
    
    # Проверяем статус
    echo "📋 Статус nginx:"
    sudo systemctl status nginx --no-pager -l | head -10
    
    # Тестируем сайт
    echo "🌐 Тестируем сайт..."
    sleep 2
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost/ || echo "  Сайт недоступен"
    
    echo "✅ Режим обслуживания принудительно отключен!"
else
    echo "❌ Ошибка в конфигурации nginx"
    exit 1
fi
