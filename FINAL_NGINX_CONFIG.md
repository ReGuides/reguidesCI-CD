# 🎯 Финальная конфигурация nginx

## **✅ Правильная конфигурация:**

```nginx
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

    # Статические файлы из public (только для файлов НЕ из _next)
    location ~* ^/(?!_next/).*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/reguides/public;
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

    # Health check endpoint
    location = /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## **🔧 Ключевые изменения:**

1. **Убрали `try_files $uri =404;`** из `/_next/static/` - не нужно
2. **Изменили regex** для статических файлов: `^/(?!_next/).*\.(js|css|...)$` - исключает файлы из `_next`
3. **Порядок location'ов** правильный

## **🚀 Применить:**
```bash
sudo nginx -t && sudo systemctl reload nginx
```

## **✅ Результат:**
- Next.js статические файлы загружаются из `/_next/static/`
- Обычные статические файлы загружаются из `/public/`
- Нет конфликтов между location'ами
- Автоматическое переключение режимов работает
