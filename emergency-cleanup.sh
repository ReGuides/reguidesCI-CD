#!/bin/bash

# Экстренная очистка всех старых бекапов
# Оставляет только 2 самых новых бекапа

echo "🚨 ЭКСТРЕННАЯ ОЧИСТКА БЕКАПОВ"
echo "================================"

# Переходим в директорию проекта
cd /var/www/reguides || { echo "❌ Директория /var/www/reguides не найдена"; exit 1; }

echo "📁 Текущие бекапы:"
ls -la .next.backup.* 2>/dev/null || { echo "   Бекапы не найдены"; exit 0; }

# Подсчитываем количество бекапов
backup_count=$(ls -1 .next.backup.* 2>/dev/null | wc -l)
echo "📊 Всего бекапов: $backup_count"

if [ "$backup_count" -le 2 ]; then
    echo "ℹ️  Количество бекапов ($backup_count) не превышает лимит (2)"
    echo "✅ Очистка не требуется"
    exit 0
fi

echo ""
echo "⚠️  ВНИМАНИЕ: Будет удалено $((backup_count - 2)) старых бекапов!"
echo "   Останутся только 2 самых новых бекапа"
echo ""

# Показываем какие бекапы останутся
echo "📋 Бекапы, которые ОСТАНУТСЯ (2 самых новых):"
ls -t .next.backup.* 2>/dev/null | head -2 | while read backup; do
    echo "   ✅ $backup"
done

echo ""
echo "🗑️  Бекапы, которые будут УДАЛЕНЫ:"
ls -t .next.backup.* 2>/dev/null | tail -n +3 | while read backup; do
    echo "   ❌ $backup"
done

echo ""
read -p "🤔 Продолжить удаление? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Операция отменена пользователем"
    exit 0
fi

echo ""
echo "🗑️  Удаляем старые бекапы..."

# Удаляем старые бекапы
deleted_count=0
ls -t .next.backup.* 2>/dev/null | tail -n +3 | while read backup; do
    echo "   Удаляем: $backup"
    rm -rf "$backup"
    ((deleted_count++))
done

echo ""
echo "✅ Удаление завершено!"

# Показываем результат
echo ""
echo "📁 Оставшиеся бекапы:"
ls -la .next.backup.* 2>/dev/null || echo "   Бекапы не найдены"

# Показываем освобожденное место
echo ""
echo "💾 Освобожденное место:"
du -sh /var/www/reguides

echo ""
echo "🎉 ЭКСТРЕННАЯ ОЧИСТКА ЗАВЕРШЕНА!"
echo "   Теперь на сервере только 2 бекапа"
echo "   При следующих деплоях будет автоматическая очистка"
