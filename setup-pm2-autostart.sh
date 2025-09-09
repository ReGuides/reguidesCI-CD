#!/bin/bash

# Скрипт для настройки автозапуска PM2
# Запуск: ./setup-pm2-autostart.sh

echo "🚀 Настраиваем автозапуск PM2..."

# Проверяем, что PM2 установлен
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 не установлен. Устанавливаем..."
    npm install -g pm2
fi

# Переходим в директорию проекта
cd /var/www/reguides || {
    echo "❌ Ошибка: Директория /var/www/reguides не найдена"
    exit 1
}

echo "📁 Текущая директория: $(pwd)"

# Останавливаем текущие процессы
echo "🛑 Останавливаем текущие процессы..."
pm2 stop all 2>/dev/null || true

# Удаляем старые процессы
echo "🗑️  Удаляем старые процессы..."
pm2 delete all 2>/dev/null || true

# Запускаем приложение
echo "▶️  Запускаем приложение..."
pm2 start ecosystem.config.js --env production

# Сохраняем конфигурацию PM2
echo "💾 Сохраняем конфигурацию PM2..."
pm2 save

# Настраиваем автозапуск
echo "🔄 Настраиваем автозапуск..."
pm2 startup

echo "✅ Автозапуск PM2 настроен!"
echo "📋 Статус процессов:"
pm2 status

echo "🔧 Для применения автозапуска выполните команду, которую показал PM2 startup"
echo "💡 Обычно это что-то вроде: sudo env PATH=\$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u \$USER --hp \$HOME"
