'use client';

import { useState } from 'react';
import MarkdownEditor from '@/components/ui/markdown-editor';

export default function TestEditorPage() {
  const [content, setContent] = useState(`# Тестовая статья

Это тестовая статья для демонстрации возможностей расширенного редактора.

## Форматирование текста

**Жирный текст** и *курсивный текст*.

### Списки

- Маркированный список
- Второй элемент
- Третий элемент

1. Нумерованный список
2. Второй элемент
3. Третий элемент

### Ссылки и код

[Пример ссылки](https://example.com)

\`\`\`javascript
// Пример кода
console.log('Hello World');
\`\`\`

### Цитаты

> Это пример цитаты
> Вторая строка цитаты

### Таблицы

| Заголовок 1 | Заголовок 2 | Заголовок 3 |
|-------------|-------------|-------------|
| Ячейка 1    | Ячейка 2    | Ячейка 3    |
| Ячейка 4    | Ячейка 5    | Ячейка 6    |

### Горизонтальная линия

---

## Работа с изображениями

Используйте кнопки изображений в панели инструментов для вставки изображений с обтеканием и создания карусели.

### Пример изображения с обтеканием

<div class="image-container float-left" style="width: 300px;">
![Пример изображения](https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Пример+изображения)
</div>

Этот текст будет обтекать изображение слева. Вы можете настроить выравнивание (лево, центр, право) и размер изображения в модальном окне вставки изображений.

### Пример карусели изображений

<div class="image-carousel">
![Первое изображение](https://via.placeholder.com/600x400/10B981/FFFFFF?text=Изображение+1)
![Второе изображение](https://via.placeholder.com/600x400/F59E0B/FFFFFF?text=Изображение+2)
![Третье изображение](https://via.placeholder.com/600x400/EF4444/FFFFFF?text=Изображение+3)
</div>

Карусель поддерживает навигацию, миниатюры и полноэкранный просмотр.

## Возможности редактора

### Режимы редактирования

1. **Редактировать** - только текстовый редактор
2. **Редактировать и просматривать** - разделенный экран с редактором и предпросмотром
3. **Предварительный просмотр** - только предпросмотр

### Кнопки изображений

- **Кнопка изображения** - для вставки одиночных изображений с настройками обтекания
- **Кнопка карусели** - для создания карусели изображений

### Справка по Markdown

Нажмите кнопку справки (значок вопроса) в режиме редактирования для отображения справки по Markdown.

### Горячие клавиши

- **Ctrl+B** - жирный текст
- **Ctrl+I** - курсив
- **Ctrl+K** - встроенный код
- **Ctrl+L** - ссылка
- **Ctrl+1/2/3** - заголовки H1/H2/H3`);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Тест расширенного редактора</h1>
        
        <div className="mb-6 p-4 bg-neutral-800 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Возможности редактора</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-300">
            <div>
              <h3 className="font-medium text-white mb-2">Режимы редактирования</h3>
              <ul className="space-y-1">
                <li>• Одна кнопка для переключения</li>
                <li>• Компактный интерфейс</li>
                <li>• Двухстрочная панель инструментов</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Работа с изображениями</h3>
              <ul className="space-y-1">
                <li>• Одиночные изображения</li>
                <li>• Карусель изображений</li>
                <li>• Настройка обтекания</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Дополнительные функции</h3>
              <ul className="space-y-1">
                <li>• Справка по Markdown</li>
                <li>• Горячие клавиши</li>
                <li>• Автосохранение</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Редактор</h2>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Начните писать вашу статью..."
          />
        </div>

        <div className="p-4 bg-neutral-800 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Инструкции по использованию</h2>
          <div className="text-sm text-neutral-300 space-y-2">
            <p><strong>Режимы редактирования:</strong> Используйте одну кнопку для циклического переключения между режимами. Панель инструментов разделена на две строки для лучшей организации.</p>
            <p><strong>Изображения:</strong> Нажмите кнопку изображения или карусели для вставки изображений с настройками.</p>
            <p><strong>Справка:</strong> Нажмите кнопку с вопросительным знаком для отображения справки по Markdown.</p>
            <p><strong>Горячие клавиши:</strong> Используйте Ctrl+B, Ctrl+I, Ctrl+K и другие для быстрого форматирования.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 