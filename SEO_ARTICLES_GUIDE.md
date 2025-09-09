# SEO для статей - Руководство

## 🎯 Проблема

До исправления у всех статей были одинаковые метаданные:
- **Title**: "Статьи и новости Genshin Impact | ReGuides | ReGuides"
- **Description**: "Актуальные новости, статьи и гайды по Genshin Impact..."
- **Canonical URL**: "https://reguides.ru/articles"

Это плохо для SEO, так как:
- ❌ Поисковики видят дублированный контент
- ❌ Нет индивидуальных заголовков для статей
- ❌ Нет уникальных описаний
- ❌ Нет правильных канонических URL

## ✅ Решение

### 1. Создан `layout.tsx` для отдельных статей

**Файл**: `src/app/articles/[id]/layout.tsx`

**Функции**:
- `generateMetadata()` - генерирует индивидуальные метаданные для каждой статьи
- Извлекает данные из базы данных
- Создает SEO-оптимизированные заголовки и описания

### 2. Создан `layout.tsx` для главной страницы статей

**Файл**: `src/app/articles/layout.tsx`

**Функции**:
- Статичные метаданные для списка статей
- Правильные Open Graph и Twitter Cards
- Канонический URL для главной страницы

## 📊 Новые метаданные для статей

### Title
```
{article.title} | ReGuides
```
**Пример**: "Обновление Genshin Impact 6.0: основные нововведения | ReGuides"

### Главная страница статей
```
Полезные гайды и советы для персонажей Genshin Impact | ReGuides
```

### Description
```
{article.excerpt} или {article.content.substring(0, 160)}...
```
**Пример**: "Обновление 6.0 под названием «Луна 1» выйдет 10 сентября 2025 года и продлится до 21 октября..."

### Главная страница статей
```
Полезные гайды и советы для персонажей Genshin Impact. Актуальные новости, статьи, обновления игры, события и дни рождения персонажей.
```

### Canonical URL
```
https://reguides.ru/articles/{article._id}
```
**Пример**: "https://reguides.ru/articles/68c046bc3ba2dd847ee5f351"

### Keywords
```
Genshin Impact, гайды, советы, персонажи, статьи, новости, {article.tags}, {characterName}
```

### Главная страница статей
```
Genshin Impact, гайды, советы, персонажи, статьи, новости, обновления, события
```

### Open Graph
- **Type**: `article`
- **Title**: SEO-оптимизированный заголовок
- **Description**: Извлеченное описание
- **Image**: Изображение статьи или логотип
- **URL**: Канонический URL статьи
- **Published Time**: Дата публикации
- **Modified Time**: Дата обновления
- **Authors**: Автор статьи
- **Section**: "Genshin Impact"
- **Tags**: Теги статьи

### Twitter Cards
- **Card Type**: `summary_large_image`
- **Title**: SEO-заголовок
- **Description**: Описание статьи
- **Image**: Изображение статьи
- **Creator**: @reguides
- **Site**: @reguides

## 🔧 Технические детали

### Извлечение текста
```typescript
const plainText = article.content.replace(/<[^>]*>/g, '').trim();
const description = article.excerpt || plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
```

### SEO-заголовок
```typescript
const seoTitle = `${article.title} | ReGuides`;
```

### Ключевые слова
```typescript
const keywords = [
  'Genshin Impact',
  'гайд',
  'статья',
  'новости',
  ...(article.tags || []),
  ...(article.characterName ? [article.characterName] : [])
].filter(Boolean).join(', ');
```

### Канонический URL
```typescript
const canonicalUrl = `https://reguides.ru/articles/${params.id}`;
```

## 🧪 Тестирование

```bash
# Запуск теста метаданных статей
cd reguides-nextjs && node test-article-metadata.js
```

## 📈 Результат

### До исправления:
- ❌ Одинаковые метаданные для всех статей
- ❌ Плохо для SEO
- ❌ Нет индивидуальности

### После исправления:
- ✅ Уникальные метаданные для каждой статьи
- ✅ SEO-оптимизированные заголовки
- ✅ Правильные описания
- ✅ Канонические URL
- ✅ Open Graph и Twitter Cards
- ✅ Структурированные данные

## 🚀 Следующие шаги

1. **Проверить метаданные** в браузере и инструментах SEO
2. **Добавить структурированные данные** (JSON-LD) для статей
3. **Оптимизировать изображения** для Open Graph
4. **Добавить метаданные** для других типов контента
5. **Настроить автоматическое обновление** метаданных при изменении статей

## 📝 Примеры

### Статья "Обновление Genshin Impact 6.0"
- **Title**: "Обновление Genshin Impact 6.0: основные нововведения | ReGuides"
- **Description**: "Обновление 6.0 под названием «Луна 1» выйдет 10 сентября 2025 года..."
- **Canonical**: "https://reguides.ru/articles/68c046bc3ba2dd847ee5f351"
- **Keywords**: "Genshin Impact, гайд, статья, новости, обновление, 6.0"

### Статья "Гайд по персонажу"
- **Title**: "Гайд по персонажу Эскофье | ReGuides"
- **Description**: "Подробный гайд по персонажу Эскофье в Genshin Impact. Рекомендации по оружию..."
- **Canonical**: "https://reguides.ru/articles/character-guide-id"
- **Keywords**: "Genshin Impact, гайд, статья, новости, Эскофье, персонаж"
