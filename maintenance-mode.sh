#!/bin/bash

# Скрипт для переключения в режим обслуживания
# Использование: ./maintenance-mode.sh [on|off]

MODE=${1:-"on"}
NGINX_CONFIG="/etc/nginx/sites-available/reguides"
MAINTENANCE_HTML="/var/www/reguides/public/maintenance.html"

echo "🔧 Управление режимом обслуживания..."

if [ "$MODE" = "on" ]; then
    echo "🛑 Включаем режим обслуживания..."
    
    # Создаем временную конфигурацию nginx для режима обслуживания
    cat > /tmp/reguides_maintenance.conf << EOF
server {
    listen 80;
    server_name reguides.ru www.reguides.ru;
    
    # Редирект на HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name reguides.ru www.reguides.ru;
    
    # SSL настройки (замените на ваши)
    ssl_certificate /etc/letsencrypt/live/reguides.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reguides.ru/privkey.pem;
    
    # Показываем страницу обслуживания
    location / {
        root /var/www/reguides/public;
        try_files /maintenance.html =503;
        add_header Retry-After 60;
    }
    
    # Разрешаем доступ к статическим файлам
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/reguides/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # Бэкапим текущую конфигурацию
    cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Применяем новую конфигурацию
    cp /tmp/reguides_maintenance.conf "$NGINX_CONFIG"
    
    # Тестируем конфигурацию nginx
    if nginx -t; then
        # Перезагружаем nginx
        systemctl reload nginx
        echo "✅ Режим обслуживания включен"
        echo "🌐 Сайт показывает страницу 'Обновление сайта'"
    else
        echo "❌ Ошибка в конфигурации nginx"
        exit 1
    fi

elif [ "$MODE" = "off" ]; then
    echo "▶️  Выключаем режим обслуживания..."
    
    # Восстанавливаем оригинальную конфигурацию
    if [ -f "${NGINX_CONFIG}.backup.$(ls -t ${NGINX_CONFIG}.backup.* 2>/dev/null | head -1 | cut -d. -f3-)" ]; then
        LATEST_BACKUP=$(ls -t ${NGINX_CONFIG}.backup.* 2>/dev/null | head -1)
        cp "$LATEST_BACKUP" "$NGINX_CONFIG"
        
        # Тестируем конфигурацию nginx
        if nginx -t; then
            # Перезагружаем nginx
            systemctl reload nginx
            echo "✅ Режим обслуживания выключен"
            echo "🌐 Сайт работает в обычном режиме"
        else
            echo "❌ Ошибка в конфигурации nginx"
            exit 1
        fi
    else
        echo "❌ Не найден backup конфигурации nginx"
        exit 1
    fi

else
    echo "❌ Неверный параметр. Используйте: on или off"
    echo "Примеры:"
    echo "  ./maintenance-mode.sh on   # Включить режим обслуживания"
    echo "  ./maintenance-mode.sh off  # Выключить режим обслуживания"
    exit 1
fi

echo "📋 Статус nginx:"
systemctl status nginx --no-pager -l

echo "🔍 Проверка конфигурации:"
nginx -t
