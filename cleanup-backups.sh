#!/bin/bash

# Скрипт для очистки старых бекапов
# Оставляет только 2 последних бекапа

echo "🧹 Очистка старых бекапов..."

# Переходим в директорию проекта
cd /var/www/reguides || { echo "❌ Директория /var/www/reguides не найдена"; exit 1; }

echo "📁 Текущие бекапы:"
ls -la .next.backup.* 2>/dev/null || echo "   Бекапы не найдены"

# Подсчитываем количество бекапов
backup_count=$(ls -1 .next.backup.* 2>/dev/null | wc -l)

if [ "$backup_count" -gt 2 ]; then
    echo "🗑️  Удаляем старые бекапы (оставляем только 2 последних):"
    ls -t .next.backup.* 2>/dev/null | tail -n +3 | xargs -r rm -rf
    echo "✅ Старые бекапы удалены"
else
    echo "ℹ️  Количество бекапов ($backup_count) не превышает лимит (2)"
fi

echo "📁 Оставшиеся бекапы:"
ls -la .next.backup.* 2>/dev/null || echo "   Бекапы не найдены"

# Очищаем старые архивы
echo "🗑️  Очистка старых архивов:"
ls -la build.tar.gz.* 2>/dev/null | head -n -2 | awk '{print $9}' | xargs -r rm -f

echo "✅ Очистка завершена!"
