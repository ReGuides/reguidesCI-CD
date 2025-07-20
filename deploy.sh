#!/bin/bash

# Скрипт для деплоя проекта
echo "🚀 Начинаем деплой проекта..."

# Остановка текущего процесса
echo "⏹️ Останавливаем текущий процесс..."
pm2 stop reguides-nextjs 2>/dev/null || true

# Обновление кода
echo "📥 Обновляем код..."
git pull origin main

# Установка зависимостей
echo "📦 Устанавливаем зависимости..."
npm ci

# Сборка проекта
echo "🔨 Собираем проект..."
npm run build

# Запуск в продакшене
echo "▶️ Запускаем приложение..."
pm2 start ecosystem.config.js --env production

# Проверка статуса
echo "✅ Проверяем статус..."
pm2 status

echo "🎉 Деплой завершен!"
echo "📊 Логи: pm2 logs reguides-nextjs"
echo "🔄 Перезапуск: pm2 restart reguides-nextjs"
echo "⏹️ Остановка: pm2 stop reguides-nextjs" 