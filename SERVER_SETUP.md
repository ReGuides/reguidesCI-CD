# Настройка сервера для монолитного Next.js приложения

## 1. Подключение к серверу

```bash
ssh root@95.215.56.7
```

## 2. Обновление системы

```bash
apt update && apt upgrade -y
```

## 3. Установка Node.js 18

```bash
# Установка NodeSource репозитория
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Установка Node.js
apt-get install -y nodejs

# Проверка версии
node --version
npm --version
```

## 4. Установка PM2

```bash
npm install -g pm2
```

## 5. Установка и настройка Nginx

```bash
# Установка nginx
apt install nginx -y

# Создание директории для логов
mkdir -p /var/log/pm2

# Копирование конфигурации nginx
cp nginx.conf /etc/nginx/sites-available/reguides

# Создание символической ссылки
ln -s /etc/nginx/sites-available/reguides /etc/nginx/sites-enabled/

# Удаление дефолтного сайта
rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
nginx -t

# Перезапуск nginx
systemctl restart nginx
systemctl enable nginx
```

## 6. Создание директории для приложения

```bash
mkdir -p /var/www/reguides
chown -R root:root /var/www/reguides
chmod -R 755 /var/www/reguides
```

## 7. Настройка файрвола

```bash
# Установка ufw если не установлен
apt install ufw -y

# Настройка правил
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable
```

## 8. Настройка SSL сертификатов

```bash
# Установка Certbot
apt install certbot python3-certbot-nginx -y

# Получение SSL сертификата для reguides.ru
certbot --nginx -d reguides.ru -d www.reguides.ru

# Автоматическое обновление сертификатов
crontab -e
# Добавить строку:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 9. Создание .env файла

```bash
cd /var/www/reguides
nano .env
```

Содержимое .env файла для монолитного приложения:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/reguides

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Next.js
NODE_ENV=production
PORT=3000

# Дополнительные настройки
NEXTAUTH_URL=https://reguides.ru
NEXTAUTH_SECRET=your-nextauth-secret

# Если используете внешнюю MongoDB
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reguides
```

## 10. Настройка MongoDB (если нужно)

```bash
# Установка MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org

# Запуск MongoDB
systemctl start mongod
systemctl enable mongod

# Проверка статуса
systemctl status mongod
```

## 11. Первый деплой

После настройки GitHub Secrets, сделайте push в master ветку:

```bash
# GitHub Actions автоматически задеплоит приложение
# Или вручную:
cd /var/www/reguides
git clone https://github.com/ReGuides/reguidesCI-CD.git .
npm ci --only=production
pm2 start ecosystem.config.js --env production
```

## 12. Проверка работы

```bash
# Проверка статуса PM2
pm2 status

# Проверка логов
pm2 logs reguides-nextjs

# Проверка nginx
systemctl status nginx

# Проверка портов
netstat -tlnp | grep :3000
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# Проверка SSL сертификата
certbot certificates
```

## 13. Полезные команды

```bash
# Перезапуск приложения
pm2 restart reguides-nextjs

# Просмотр логов
pm2 logs reguides-nextjs --lines 100

# Мониторинг
pm2 monit

# Перезапуск nginx
systemctl restart nginx

# Проверка конфигурации nginx
nginx -t

# Проверка SSL
openssl s_client -connect reguides.ru:443 -servername reguides.ru
```

## 14. Troubleshooting

### Если приложение не запускается:
```bash
# Проверка логов
pm2 logs reguides-nextjs

# Проверка порта
lsof -i :3000

# Проверка переменных окружения
pm2 env reguides-nextjs

# Проверка памяти
free -h
```

### Если nginx не работает:
```bash
# Проверка статуса
systemctl status nginx

# Проверка конфигурации
nginx -t

# Просмотр логов
tail -f /var/log/nginx/reguides_error.log
```

### Если SSL не работает:
```bash
# Проверка сертификатов
certbot certificates

# Обновление сертификатов
certbot renew --dry-run

# Проверка конфигурации nginx
nginx -t
```

## 15. Мониторинг производительности

```bash
# Мониторинг системы
htop

# Мониторинг диска
df -h

# Мониторинг памяти
free -h

# Мониторинг сети
iftop

# Логи nginx в реальном времени
tail -f /var/log/nginx/reguides_access.log
``` 