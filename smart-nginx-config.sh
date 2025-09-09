#!/bin/bash

# Умная конфигурация nginx с автоматическим переключением режимов
# Использование: ./smart-nginx-config.sh

echo "🧠 Создаем умную конфигурацию nginx..."

# Создаем конфигурацию с проверкой статуса PM2
sudo tee /etc/nginx/sites-available/reguides > /dev/null << 'EOF'
server {
    listen 80;
    server_name reguides.ru www.reguides.ru;

    # Проверяем статус PM2 через health check
    location / {
        # Пробуем подключиться к приложению
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Если приложение недоступно, показываем страницу обслуживания
        error_page 502 503 504 = @maintenance;
    }

    # Страница обслуживания
    location @maintenance {
        root /var/www/reguides/public;
        try_files /maintenance.html =503;
    }

    # Прямой доступ к странице обслуживания
    location = /maintenance.html {
        root /var/www/reguides/public;
    }
}
EOF

# Создаем символическую ссылку
sudo ln -sf /etc/nginx/sites-available/reguides /etc/nginx/sites-enabled/reguides

# Удаляем default конфигурацию
sudo rm -f /etc/nginx/sites-enabled/default

# Тестируем конфигурацию
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✅ Умная конфигурация nginx создана"
    echo "🌐 Сайт автоматически переключается между режимами"
else
    echo "❌ Ошибка в конфигурации nginx"
    exit 1
fi
