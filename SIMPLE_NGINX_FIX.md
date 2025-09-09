# 🚀 Простое исправление nginx для статических файлов

## **🔧 Замените весь блок location в HTTPS секции:**

**Удалите старый блок:**
```nginx
# Показываем страницу обслуживания
location / {
    root /var/www/reguides/public;
    try_files /maintenance.html =503;
    add_header Retry-After 60;
}
```

**Замените на:**
```nginx
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
```

## **🚀 Применить:**
```bash
sudo nginx -t && sudo systemctl reload nginx
```

## **✅ Готово!**
Статические файлы Next.js теперь будут загружаться правильно!
