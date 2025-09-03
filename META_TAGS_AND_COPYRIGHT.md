# Мета-теги и копирайт ReGuides

## Обзор

Документация по добавленным мета-тегам, копирайту и верификации сайта для ReGuides.

## Мета-теги

### 1. Яндекс.Вебмастер
```html
<meta name="yandex-verification" content="a3e9f8cfe55d210d" />
```
- **Назначение:** Верификация сайта в Яндекс.Вебмастере
- **Код:** `a3e9f8cfe55d210d`
- **Расположение:** `src/app/layout.tsx` в metadata.verification.yandex

### 2. Копирайт
```html
<meta name="copyright" content="© 2025 ReGuides. Все права защищены." />
```
- **Назначение:** Указание авторских прав
- **Расположение:** `src/app/layout.tsx` в metadata.other.copyright

### 3. Автор
```html
<meta name="author" content="ReGuides" />
```
- **Назначение:** Указание автора сайта
- **Расположение:** `src/app/layout.tsx` в metadata.other.author

### 4. Роботы
```html
<meta name="robots" content="index, follow" />
```
- **Назначение:** Инструкции для поисковых роботов
- **Расположение:** `src/app/layout.tsx` в metadata.other.robots

## Копирайт на сайте

### 1. Футер
- **Расположение:** `src/components/layout/footer.tsx`
- **Текст:** `© {new Date().getFullYear()} ReGuides`
- **Особенность:** Динамически показывает текущий год

### 2. Консоль браузера
- **Расположение:** `src/components/copyright-console.tsx`
- **Функция:** Выводит стилизованный копирайт в консоль
- **Стили:** Фиолетовый градиент с эффектами

## Структура файлов

```
reguides-nextjs/
├── src/
│   ├── app/
│   │   └── layout.tsx              # Основные мета-теги
│   └── components/
│       ├── layout/
│       │   └── footer.tsx          # Копирайт в футере
│       └── copyright-console.tsx   # Копирайт в консоли
└── META_TAGS_AND_COPYRIGHT.md      # Эта документация
```

## Технические детали

### Next.js Metadata API
```typescript
export const metadata: Metadata = {
  title: 'ReGuides',
  description: 'Лучшие гайды по Genshin Impact',
  icons: {
    icon: '/favicon.ico',
  },
  verification: {
    yandex: 'a3e9f8cfe55d210d',
  },
  other: {
    'copyright': '© 2025 ReGuides. Все права защищены.',
    'author': 'ReGuides',
    'robots': 'index, follow',
  },
};
```

### Консольный копирайт
```typescript
console.log(
  '%c© 2025 ReGuides',
  'color: #8b5cf6; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);'
);
```

## SEO преимущества

### 1. Верификация в поисковиках
- ✅ **Яндекс.Вебмастер** - полный доступ к статистике
- ✅ **Google Search Console** - можно добавить аналогично
- ✅ **Bing Webmaster** - можно добавить аналогично

### 2. Защита авторских прав
- ✅ **Мета-тег copyright** - юридическая защита
- ✅ **Копирайт в футере** - видимая защита
- ✅ **Консольный копирайт** - дополнительная защита

### 3. SEO оптимизация
- ✅ **Мета-тег robots** - контроль индексации
- ✅ **Мета-тег author** - указание авторства
- ✅ **Структурированные данные** - улучшение в поиске

## Добавление новых мета-тегов

### 1. Google Search Console
```typescript
verification: {
  yandex: 'a3e9f8cfe55d210d',
  google: 'your-google-verification-code',
},
```

### 2. Дополнительные мета-теги
```typescript
other: {
  'copyright': '© 2025 ReGuides. Все права защищены.',
  'author': 'ReGuides',
  'robots': 'index, follow',
  'theme-color': '#8b5cf6',
  'msapplication-TileColor': '#8b5cf6',
},
```

## Проверка работы

### 1. Мета-теги
- Откройте сайт в браузере
- Нажмите F12 → Elements
- Найдите тег `<head>`
- Проверьте наличие всех мета-тегов

### 2. Копирайт в футере
- Прокрутите страницу вниз
- Убедитесь, что копирайт отображается

### 3. Консольный копирайт
- Нажмите F12 → Console
- Убедитесь, что копирайт выводится стилизованно

## Обновление копирайта

### Автоматическое обновление года
Копирайт в футере автоматически обновляется:
```typescript
© {new Date().getFullYear()} ReGuides
```

### Ручное обновление
При необходимости обновите:
1. `src/app/layout.tsx` - мета-теги
2. `src/components/copyright-console.tsx` - консольный копирайт
3. Этот файл документации

## Правовые аспекты

### Авторское право
- ✅ **Автоматически возникает** при создании контента
- ✅ **Не требует регистрации** в большинстве стран
- ✅ **Защищает код, дизайн, контент**

### Товарный знак
- ⚠️ **Название "ReGuides"** не защищено как бренд
- ⚠️ **Логотип "R"** не защищен как товарный знак
- ⚠️ **Другие могут использовать** похожие названия

### Рекомендации
1. **Добавить копирайт везде** на сайте
2. **Рассмотреть регистрацию** товарного знака
3. **Документировать авторство** всех материалов
