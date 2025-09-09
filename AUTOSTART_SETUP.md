# 🚀 Настройка автозапуска PM2

## 📋 Что нужно сделать на сервере

### 1. Настройка автозапуска PM2

```bash
# Подключитесь к серверу
ssh user@your-server

# Перейдите в директорию проекта
cd /var/www/reguides

# Установите PM2 глобально (если не установлен)
npm install -g pm2

# Запустите скрипт настройки автозапуска
chmod +x setup-pm2-autostart.sh
./setup-pm2-autostart.sh
```

### 2. Применение автозапуска

После выполнения скрипта PM2 покажет команду для настройки автозапуска. Обычно это:

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

**Выполните эту команду на сервере!**

### 3. Проверка автозапуска

```bash
# Проверьте статус PM2
pm2 status

# Проверьте, что процессы сохранены
pm2 save

# Проверьте автозапуск
pm2 startup
```

### 4. Тестирование автозапуска

```bash
# Перезагрузите сервер
sudo reboot

# После перезагрузки проверьте статус
pm2 status
```

## 🔧 Управление режимом обслуживания

### Включить режим обслуживания
```bash
cd /var/www/reguides
./maintenance-mode.sh on
```

### Выключить режим обслуживания
```bash
cd /var/www/reguides
./maintenance-mode.sh off
```

## 📊 Мониторинг

### Проверка статуса PM2
```bash
pm2 status
pm2 logs
pm2 monit
```

### Проверка nginx
```bash
sudo systemctl status nginx
sudo nginx -t
```

## 🛠️ Устранение проблем

### Если PM2 не запускается автоматически
```bash
# Переустановите автозапуск
pm2 unstartup
pm2 startup
# Выполните показанную команду
pm2 save
```

### Если сайт не отвечает
```bash
# Проверьте статус
pm2 status
pm2 logs reguides-nextjs

# Перезапустите приложение
pm2 restart reguides-nextjs
```

### Если режим обслуживания не работает
```bash
# Проверьте конфигурацию nginx
sudo nginx -t

# Перезагрузите nginx
sudo systemctl reload nginx
```

## 📝 Важные файлы

- `setup-pm2-autostart.sh` - настройка автозапуска PM2
- `maintenance-mode.sh` - управление режимом обслуживания
- `public/maintenance.html` - страница "Сайт обновляется"
- `ecosystem.config.js` - конфигурация PM2

## ✅ Результат

После настройки:
- ✅ Сайт автоматически запускается при перезагрузке сервера
- ✅ Во время деплоя показывается красивая страница "Обновление сайта"
- ✅ Нет ошибок 500 во время обновления
- ✅ Автоматическое восстановление при ошибках деплоя
