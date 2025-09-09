#!/bin/bash

# Скрипт для принудительной очистки бэкапов на сервере
# Запуск: ssh user@server "bash -s" < force-cleanup.sh

echo "🧹 Принудительная очистка бэкапов на сервере..."

# Переходим в директорию проекта
cd /var/www/reguides || {
    echo "❌ Ошибка: Директория /var/www/reguides не найдена"
    exit 1
}

echo "📁 Текущая директория: $(pwd)"

# Показываем текущие бэкапы
echo "📋 Текущие бэкапы:"
ls -la .next.backup.* 2>/dev/null || echo "   Нет бэкапов"

# Показываем размер бэкапов
echo "💾 Размер бэкапов:"
du -sh .next.backup.* 2>/dev/null || echo "   Нет бэкапов"

# Удаляем ВСЕ бэкапы
echo "🗑️  Удаляем ВСЕ бэкапы..."
rm -rf .next.backup.* 2>/dev/null

# Проверяем результат
if [ $? -eq 0 ]; then
    echo "✅ Все бэкапы успешно удалены"
else
    echo "⚠️  Некоторые бэкапы не удалось удалить"
fi

# Очищаем старые архивы
echo "🗑️  Удаляем старые архивы..."
rm -f build.tar.gz.* 2>/dev/null
rm -f *.tar.gz 2>/dev/null

# Очищаем логи PM2
echo "🧹 Очищаем логи PM2..."
pm2 flush 2>/dev/null || echo "   PM2 не запущен"

# Очищаем кэш npm
echo "🧹 Очищаем кэш npm..."
npm cache clean --force 2>/dev/null || echo "   npm cache не найден"

# Показываем освобожденное место
echo "💾 Освобожденное место:"
df -h /var/www/reguides

echo "✅ Принудительная очистка завершена!"
echo "📊 Статистика:"
echo "   Директория: $(pwd)"
echo "   Свободное место: $(df -h /var/www/reguides | tail -1 | awk '{print $4}')"
echo "   Размер проекта: $(du -sh . | awk '{print $1}')"
