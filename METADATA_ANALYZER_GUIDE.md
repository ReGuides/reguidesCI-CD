# 🔍 Руководство по анализатору мета-данных

## **Что нового добавлено**

### **1. Расширенные Open Graph теги**
- **og:site_name** - название сайта
- **og:locale** - локаль страницы
- **og:image** с размерами - изображения с width, height, alt
- **Множественные изображения** - поддержка нескольких og:image

### **2. Расширенные Twitter теги**
- **twitter:site** - аккаунт сайта в Twitter
- **twitter:creator** - создатель контента
- **Множественные изображения** - поддержка нескольких twitter:image

### **3. Технические мета-теги**
- **language** - язык страницы из `<html lang>`
- **charset** - кодировка страницы
- **viewport** - настройки viewport
- **robots** - директивы для поисковых роботов
- **theme-color** - цвет темы браузера
- **author** - автор страницы
- **generator** - генератор страницы
- **rating** - рейтинг контента
- **geo** - географические данные

### **4. Языковые версии**
- **hreflang** - альтернативные языковые версии страницы

### **5. Анализ изображений**
- **Размеры Open Graph изображений** - width × height
- **Alt-текст** для изображений
- **Множественные изображения** для социальных сетей

## **Как использовать**

1. **Откройте админку** → "Анализатор мета-данных"
2. **Вставьте URL** страницы с вашего сайта
3. **Нажмите "Анализировать"**
4. **Просмотрите результаты** по категориям:
   - Основные мета-теги
   - Open Graph
   - Twitter Cards
   - Дополнительные Open Graph теги
   - Дополнительные Twitter теги
   - Технические мета-теги
   - Hreflang (языковые версии)
   - Структурированные данные (JSON-LD)
   - Анализ контента

## **Что проверять для SEO**

### **✅ Обязательные теги**
- **Title** - уникальный, до 60 символов
- **Description** - до 160 символов, привлекательный
- **Canonical URL** - правильный URL страницы
- **og:title** - совпадает с title
- **og:description** - совпадает с description
- **og:image** - изображение 1200×630px
- **twitter:card** - "summary_large_image"

### **✅ Рекомендуемые теги**
- **og:site_name** - название сайта
- **og:locale** - "ru_RU" для русских страниц
- **robots** - "index, follow"
- **language** - "ru" для русских страниц
- **viewport** - "width=device-width, initial-scale=1"

### **✅ Дополнительные теги**
- **theme-color** - цвет бренда
- **author** - автор контента
- **generator** - "Next.js"
- **hreflang** - для многоязычных сайтов

## **Примеры хороших мета-тегов**

### **Страница персонажа**
```html
<title>Эскофье - Гайд по персонажу | ReGuides</title>
<meta name="description" content="Подробный гайд по персонажу Эскофье в Genshin Impact. Рекомендации по оружию, артефактам, талантам и сборкам. Элемент: Крио, Оружие: Копьё.">
<meta property="og:title" content="Эскофье - Гайд по персонажу | ReGuides">
<meta property="og:description" content="Подробный гайд по персонажу Эскофье в Genshin Impact. Рекомендации по оружию, артефактам, талантам и сборкам. Элемент: Крио, Оружие: Копьё.">
<meta property="og:image" content="https://reguides.ru/images/characters/escoffier.jpg" width="800" height="1120">
<meta property="og:type" content="article">
<meta property="og:site_name" content="ReGuides">
<meta property="og:locale" content="ru_RU">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Эскофье - Гайд по персонажу | ReGuides">
<meta name="twitter:description" content="Подробный гайд по персонажу Эскофье в Genshin Impact. Рекомендации по оружию, артефактам, талантам и сборкам. Элемент: Крио, Оружие: Копьё.">
<meta name="twitter:image" content="https://reguides.ru/images/characters/escoffier.jpg">
<link rel="canonical" href="https://reguides.ru/characters/escoffier">
<meta name="robots" content="index, follow">
<meta name="language" content="ru">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#1a1a1a">
<meta name="author" content="ReGuides">
<meta name="generator" content="Next.js">
```

## **Частые проблемы**

### **❌ Проблемы с изображениями**
- Отсутствуют размеры og:image
- Неправильные пропорции (растянутые изображения)
- Отсутствует alt-текст

### **❌ Проблемы с мета-тегами**
- Дублирующиеся title и og:title
- Отсутствует canonical URL
- Неправильная локаль (en вместо ru)

### **❌ Проблемы с контентом**
- Слишком длинный title (>60 символов)
- Слишком длинное description (>160 символов)
- Отсутствуют ключевые слова

## **Советы по оптимизации**

1. **Используйте уникальные мета-теги** для каждой страницы
2. **Проверяйте размеры изображений** - 1200×630px для ландшафта, 800×1120px для портрета
3. **Добавляйте структурированные данные** (JSON-LD) для лучшего понимания контента
4. **Проверяйте canonical URL** - должен указывать на правильную страницу
5. **Используйте hreflang** для многоязычных сайтов
6. **Добавляйте theme-color** для лучшего UX в мобильных браузерах

---

**💡 Теперь анализатор показывает ВСЕ важные мета-теги для поисковиков!**
