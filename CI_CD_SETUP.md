# Настройка CI/CD

## Варианты деплоя

### 1. GitHub Actions + VPS (Рекомендуется)

#### Настройка на сервере:

1. **Установите необходимые инструменты:**
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2
npm install -g pm2

# Git
sudo apt-get install git
```

2. **Клонируйте проект:**
```bash
git clone https://github.com/your-username/reguides-nextjs.git
cd reguides-nextjs
```

3. **Установите зависимости:**
```bash
npm ci
npm run build
```

4. **Запустите через PM2:**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Настройка GitHub Secrets:

В настройках репозитория (Settings → Secrets and variables → Actions) добавьте:

- `HOST` - IP адрес вашего сервера
- `USERNAME` - имя пользователя на сервере
- `SSH_KEY` - приватный SSH ключ

#### Настройка SSH:

1. **Сгенерируйте SSH ключ:**
```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

2. **Добавьте публичный ключ на сервер:**
```bash
cat ~/.ssh/id_rsa.pub | ssh user@your-server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

3. **Добавьте приватный ключ в GitHub Secrets**

### 2. Vercel (Простой вариант)

1. **Подключите репозиторий к Vercel**
2. **Настройте переменные окружения:**
   - `MONGODB_URI` = `mongodb://reguides.ru:27017/reguides`

### 3. Railway (Альтернатива)

1. **Подключите репозиторий к Railway**
2. **Настройте переменные окружения**

## Автоматический деплой

После настройки CI/CD:

1. **Пуш в main/master ветку** → автоматический деплой
2. **Pull Request** → тестирование без деплоя

## Ручной деплой

```bash
# На сервере
chmod +x deploy.sh
./deploy.sh
```

## Мониторинг

```bash
# Статус приложения
pm2 status

# Логи
pm2 logs reguides-nextjs

# Мониторинг ресурсов
pm2 monit
```

## Полезные команды

```bash
# Перезапуск
pm2 restart reguides-nextjs

# Остановка
pm2 stop reguides-nextjs

# Удаление из автозапуска
pm2 unstartup

# Обновление PM2
pm2 update
```

## Troubleshooting

### Проблемы с подключением к MongoDB:
- Проверьте доступность порта 27017
- Убедитесь, что MongoDB запущен
- Проверьте настройки firewall

### Проблемы с PM2:
- Проверьте логи: `pm2 logs reguides-nextjs`
- Перезапустите: `pm2 restart reguides-nextjs`
- Проверьте конфигурацию: `pm2 show reguides-nextjs` 