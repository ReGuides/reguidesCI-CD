# ⚡ Быстрое исправление nginx

## **🔧 Что нужно изменить в `/etc/nginx/sites-available/reguides`:**

Замените блок `location /` в HTTPS секции:

**Было:**
```nginx
# Показываем страницу обслуживания
location / {
    root /var/www/reguides/public;
    try_files /maintenance.html =503;
    add_header Retry-After 60;
}
```

**Стало:**
```nginx
# Основное приложение с автоматическим переключением
location / {
    # Проверяем доступность приложения
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

# Статические файлы Next.js (должно быть ПЕРЕД основным location)
location /_next/ {
    alias /var/www/reguides/.next/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}
```

## **🚀 Применить изменения:**
```bash
sudo nginx -t && sudo systemctl reload nginx
```

## **✅ Готово!**
Теперь сайт автоматически переключается между режимами!
