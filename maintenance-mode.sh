#!/bin/bash

# Скрипт для переключения в режим обслуживания
# Использование: ./maintenance-mode.sh [on|off]

MODE=${1:-"on"}
NGINX_CONFIG="/etc/nginx/sites-available/reguides"
MAINTENANCE_HTML="/var/www/reguides/public/maintenance.html"

# Проверяем права доступа
if [ ! -w "$NGINX_CONFIG" ] && [ "$EUID" -ne 0 ]; then
    echo "❌ Недостаточно прав для изменения конфигурации nginx"
    echo "💡 Попробуйте: sudo ./maintenance-mode.sh $MODE"
    exit 1
fi

echo "🔧 Управление режимом обслуживания..."
echo "📁 Рабочая директория: $(pwd)"
echo "📋 Конфигурация nginx: $NGINX_CONFIG"
echo "📄 HTML страница: $MAINTENANCE_HTML"

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

    # Проверяем существование конфигурации
    if [ ! -f "$NGINX_CONFIG" ]; then
        echo "❌ Файл конфигурации nginx не найден: $NGINX_CONFIG"
        echo "💡 Создаем базовую конфигурацию..."
        mkdir -p "$(dirname "$NGINX_CONFIG")"
        cat > "$NGINX_CONFIG" << 'EOF'
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
    fi
    
    # Бэкапим текущую конфигурацию
    cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Применяем новую конфигурацию
    cp /tmp/reguides_maintenance.conf "$NGINX_CONFIG"
    
    # Тестируем конфигурацию nginx
    if sudo nginx -t; then
        # Перезагружаем nginx
        sudo systemctl reload nginx
        echo "✅ Режим обслуживания включен"
        echo "🌐 Сайт показывает страницу 'Обновление сайта'"
    else
        echo "❌ Ошибка в конфигурации nginx"
        exit 1
    fi

elif [ "$MODE" = "off" ]; then
    echo "▶️  Выключаем режим обслуживания..."
    
    # Восстанавливаем оригинальную конфигурацию
    echo "🔍 Ищем backup конфигурации..."
    LATEST_BACKUP=$(ls -t ${NGINX_CONFIG}.backup.* 2>/dev/null | head -1)
    
    if [ -n "$LATEST_BACKUP" ] && [ -f "$LATEST_BACKUP" ]; then
        echo "📁 Найден backup: $LATEST_BACKUP"
        cp "$LATEST_BACKUP" "$NGINX_CONFIG"
        
        # Проверяем символическую ссылку
        if [ ! -L /etc/nginx/sites-enabled/reguides ]; then
            echo "🔗 Создаем символическую ссылку..."
            sudo ln -sf /etc/nginx/sites-available/reguides /etc/nginx/sites-enabled/reguides
        fi
        
        # Удаляем default конфигурацию если есть
        sudo rm -f /etc/nginx/sites-enabled/default
        
        # Тестируем конфигурацию nginx
        if sudo nginx -t; then
            # Принудительно перезапускаем nginx
            sudo systemctl stop nginx
            sleep 1
            sudo systemctl start nginx
            echo "✅ Режим обслуживания выключен"
            echo "🌐 Сайт работает в обычном режиме"
        else
            echo "❌ Ошибка в конфигурации nginx"
            exit 1
        fi
    else
        echo "❌ Backup конфигурации не найден"
        echo "📋 Доступные backup файлы:"
        ls -la ${NGINX_CONFIG}.backup.* 2>/dev/null || echo "  Нет backup файлов"
        
        # Попробуем восстановить конфигурацию вручную
        echo "🔧 Пытаемся восстановить конфигурацию вручную..."
        cat > "$NGINX_CONFIG" << 'EOF'
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
        
        # Тестируем восстановленную конфигурацию
        if sudo nginx -t; then
            sudo systemctl stop nginx
            sleep 1
            sudo systemctl start nginx
            echo "✅ Конфигурация восстановлена вручную"
            echo "🌐 Сайт работает в обычном режиме"
        else
            echo "❌ Не удалось восстановить конфигурацию"
            exit 1
        fi
    fi

else
    echo "❌ Неверный параметр. Используйте: on или off"
    echo "Примеры:"
    echo "  ./maintenance-mode.sh on   # Включить режим обслуживания"
    echo "  ./maintenance-mode.sh off  # Выключить режим обслуживания"
    exit 1
fi

echo "📋 Статус nginx:"
sudo systemctl status nginx --no-pager -l

echo "🔍 Проверка конфигурации:"
sudo nginx -t
