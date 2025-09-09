#!/bin/bash

# Скрипт для быстрого исправления nginx для статических файлов
# Использование: ./fix-nginx-static.sh

echo "🔧 Исправляем nginx для статических файлов Next.js..."

# Создаем backup текущей конфигурации
sudo cp /etc/nginx/sites-available/reguides /etc/nginx/sites-available/reguides.backup.$(date +%Y%m%d_%H%M%S)

# Создаем новую конфигурацию
sudo tee /etc/nginx/sites-available/reguides > /dev/null << 'EOF'
server {
    listen 80;
    server_name reguides.ru www.reguides.ru;
    
    # Редирект на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name reguides.ru www.reguides.ru;
    
    # SSL настройки (замените на ваши)
    ssl_certificate /etc/letsencrypt/live/reguides.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reguides.ru/privkey.pem;
    
    # Статические файлы Next.js (ОБЯЗАТЕЛЬНО ПЕРВЫМ!)
    location /_next/static/ {
        alias /var/www/reguides/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Основное приложение
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
        
        # Таймауты для быстрого переключения
        proxy_connect_timeout 2s;
        proxy_send_timeout 2s;
        proxy_read_timeout 2s;
        
        # Если приложение недоступно, показываем страницу обслуживания
        error_page 502 503 504 = @maintenance;
    }

    # Страница обслуживания
    location @maintenance {
        root /var/www/reguides/public;
        try_files /maintenance.html =503;
        add_header Retry-After 30;
    }

    # Прямой доступ к странице обслуживания
    location = /maintenance.html {
        root /var/www/reguides/public;
    }

    # Разрешаем доступ к статическим файлам из public
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/reguides/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location = /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Проверяем конфигурацию
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✅ nginx исправлен и перезагружен"
    echo "🌐 Статические файлы Next.js теперь работают"
else
    echo "❌ Ошибка в конфигурации nginx"
    echo "🔄 Восстанавливаем backup..."
    sudo cp /etc/nginx/sites-available/reguides.backup.* /etc/nginx/sites-available/reguides
    exit 1
fi
