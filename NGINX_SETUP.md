# 🔧 Настройка nginx для автоматического переключения режимов

## **📋 Что нужно сделать один раз на сервере:**

### **1. Откройте конфигурацию nginx:**
```bash
sudo nano /etc/nginx/sites-available/reguides
```

### **2. Замените содержимое на:**
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
    
    # Основное приложение
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

    # Прямой доступ к странице обслуживания
    location = /maintenance.html {
        root /var/www/reguides/public;
    }

    # Статические файлы Next.js (должно быть ПЕРЕД основным location)
    location /_next/static/ {
        alias /var/www/reguides/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
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
```

### **3. Создайте символическую ссылку:**
```bash
sudo ln -sf /etc/nginx/sites-available/reguides /etc/nginx/sites-enabled/reguides
```

### **4. Удалите default конфигурацию:**
```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

### **5. Проверьте SSL сертификаты:**
```bash
# Убедитесь, что сертификаты существуют
ls -la /etc/letsencrypt/live/reguides.ru/
```

### **6. Проверьте конфигурацию:**
```bash
sudo nginx -t
```

### **7. Перезагрузите nginx:**
```bash
sudo systemctl reload nginx
```

## **✅ Готово!**

Теперь nginx будет автоматически:
- Показывать страницу обслуживания когда PM2 остановлен
- Переключаться на приложение когда PM2 запущен
- Работать за 2 секунды без всяких скриптов

## **🧪 Тестирование:**

```bash
# Остановите PM2
pm2 stop reguides-nextjs

# Проверьте сайт - должна показаться страница обслуживания
curl -k https://reguides.ru/
# или
curl -k https://localhost/

# Запустите PM2
pm2 start ecosystem.config.js --env production

# Проверьте сайт - должно показаться приложение
curl -k https://reguides.ru/
# или
curl -k https://localhost/

# Проверьте health check
curl -k https://reguides.ru/health
```
