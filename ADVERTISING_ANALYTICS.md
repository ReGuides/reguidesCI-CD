# Рекламная аналитика ReGuides

## Обзор

Рекламная аналитика - это специализированный раздел аналитики, который отслеживает эффективность рекламных кампаний, UTM-меток и конверсий. Система полностью соответствует требованиям 152-ФЗ и не собирает персональные данные.

## Возможности

### 📊 Основные метрики
- **Всего визитов** - общее количество посещений по рекламе
- **Уникальные посетители** - количество уникальных пользователей
- **Новые посетители** - первый визит по рекламе
- **Возвраты** - повторные визиты
- **Конверсии** - достигнутые цели
- **Стоимость конверсий** - общая ценность конверсий

### 🎯 UTM-метки
- **utm_source** - источник трафика (google, facebook, yandex, etc.)
- **utm_medium** - тип рекламы (cpc, banner, email, social)
- **utm_campaign** - название кампании
- **utm_term** - ключевые слова
- **utm_content** - контент объявления

### 📈 Детальная статистика
- Топ UTM-источников по эффективности
- Топ рекламных кампаний
- Конверсии по целям
- Активность по времени (часы, дни недели)
- Статистика по регионам
- Статистика по устройствам

## Как использовать

### 1. Добавление UTM-меток к ссылкам

```html
<!-- Пример ссылки с UTM-метками -->
<a href="https://reguides.ru/character/mona?utm_source=google&utm_medium=cpc&utm_campaign=genshin_guide&utm_term=mona+build">
  Гайд по Моне
</a>
```

### 2. Отслеживание конверсий

```javascript
import { trackConversion } from '@/lib/analytics';

// При достижении цели (например, регистрация)
trackConversion('registration', 1000);

// При покупке
trackConversion('purchase', 5000);
```

### 3. Доступ к рекламной аналитике

Перейдите в админ-панель: `/admin/analytics/advertising`

## Фильтры и периоды

- **Периоды**: 1 день, 7 дней, 30 дней, 90 дней, все время
- **Фильтры по UTM-источнику**
- **Фильтры по рекламной кампании**
- **Фильтры по типу рекламы**

## API Endpoints

### POST `/api/analytics/advertising/track`
Отправка данных рекламной аналитики

**Параметры:**
```json
{
  "anonymousSessionId": "anon_abc123",
  "page": "/character/mona",
  "pageType": "character",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "genshin_guide",
  "deviceCategory": "desktop",
  "region": "europe",
  "isFirstVisit": true
}
```

### GET `/api/analytics/advertising/stats`
Получение рекламной статистики

**Параметры запроса:**
- `period` - период (1d, 7d, 30d, 90d, all)
- `utmSource` - фильтр по источнику
- `utmCampaign` - фильтр по кампании
- `utmMedium` - фильтр по типу рекламы

## Примеры использования

### Google Ads
```
https://reguides.ru/?utm_source=google&utm_medium=cpc&utm_campaign=genshin_characters&utm_term=genshin+impact+guide
```

### Facebook Ads
```
https://reguides.ru/?utm_source=facebook&utm_medium=social&utm_campaign=genshin_community&utm_content=video_ad
```

### Email рассылка
```
https://reguides.ru/?utm_source=email&utm_medium=email&utm_campaign=weekly_newsletter&utm_content=mona_birthday
```

### Партнерские ссылки
```
https://reguides.ru/?utm_source=partner&utm_medium=referral&utm_campaign=genshin_guide&utm_content=top_guide_site
```

## Метрики эффективности

### CTR (Click-Through Rate)
- **Формула**: (Клики / Показы) × 100%
- **Цель**: 1-3% для поисковой рекламы, 0.5-1% для баннеров

### CR (Conversion Rate)
- **Формула**: (Конверсии / Визиты) × 100%
- **Цель**: 2-5% для информационных сайтов

### CPA (Cost Per Acquisition)
- **Формула**: Стоимость кампании / Количество конверсий
- **Цель**: Зависит от типа конверсии

### ROAS (Return on Ad Spend)
- **Формула**: (Доход от рекламы / Стоимость рекламы) × 100%
- **Цель**: >100% (прибыльность)

## Лучшие практики

### 1. Названия кампаний
- Используйте понятные названия: `genshin_characters_q1_2025`
- Включайте период: `summer_sale_2025`
- Указывайте тип: `brand_awareness`, `conversion`

### 2. UTM-метки
- **utm_source**: google, facebook, yandex, vk, telegram
- **utm_medium**: cpc, banner, email, social, referral
- **utm_campaign**: seasonal_promotion, product_launch
- **utm_term**: genshin+impact+guide, mona+build
- **utm_content**: text_ad, video_ad, banner_728x90

### 3. Анализ результатов
- Сравнивайте эффективность разных источников
- Отслеживайте конверсии по времени
- Анализируйте поведение пользователей
- Оптимизируйте кампании на основе данных

## Соответствие 152-ФЗ

✅ **НЕ собирается:**
- IP-адреса
- Точная геолокация
- Персональные данные пользователей
- Уникальные идентификаторы

✅ **Собирается (анонимно):**
- UTM-метки (без привязки к личности)
- Обезличенная география (континент)
- Технические характеристики устройств
- Поведенческие метрики (без идентификации)

## Техническая информация

### Модель данных
- **AdvertisingAnalytics** - основная модель для хранения данных
- **Индексы** - оптимизированы для быстрых запросов
- **Агрегация** - MongoDB aggregation pipeline для статистики

### Производительность
- Асинхронная отправка данных
- Кэширование результатов
- Оптимизированные запросы к БД

### Безопасность
- Валидация входных данных
- Защита от SQL-инъекций
- Логирование всех операций

## Поддержка

При возникновении вопросов или проблем:
1. Проверьте логи сервера в `/admin/logs`
2. Убедитесь в корректности UTM-меток
3. Проверьте настройки фильтров
4. Обратитесь к документации по основной аналитике
