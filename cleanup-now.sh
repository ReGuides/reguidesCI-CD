#!/bin/bash

# Простая команда для немедленной очистки бекапов
# Выполнить на сервере: bash cleanup-now.sh

echo "🧹 Немедленная очистка бекапов..."

cd /var/www/reguides

# Показываем текущее количество
current_count=$(ls -1 .next.backup.* 2>/dev/null | wc -l)
echo "📊 Текущее количество бекапов: $current_count"

if [ "$current_count" -gt 2 ]; then
    echo "🗑️  Удаляем старые бекапы (оставляем только 2)..."
    
    # Удаляем все кроме 2 самых новых
    ls -t .next.backup.* 2>/dev/null | tail -n +3 | xargs -r rm -rf
    
    echo "✅ Очистка завершена!"
    
    # Показываем результат
    remaining_count=$(ls -1 .next.backup.* 2>/dev/null | wc -l)
    echo "📊 Оставшихся бекапов: $remaining_count"
    
    echo "📁 Оставшиеся бекапы:"
    ls -la .next.backup.* 2>/dev/null
else
    echo "ℹ️  Количество бекапов ($current_count) не превышает лимит (2)"
fi

echo "💾 Размер директории:"
du -sh /var/www/reguides
