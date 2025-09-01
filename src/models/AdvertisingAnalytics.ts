import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvertisingAnalytics extends Document {
  // Анонимная информация о посетителе (без персональных данных)
  anonymousSessionId: string;
  
  // Рекламная информация
  utmSource?: string;        // Источник трафика (google, facebook, yandex, etc.)
  utmMedium?: string;        // Тип рекламы (cpc, banner, email, social)
  utmCampaign?: string;      // Название кампании
  utmTerm?: string;          // Ключевые слова
  utmContent?: string;       // Контент объявления
  
  // Информация о странице
  page: string;
  pageType: 'character' | 'weapon' | 'artifact' | 'news' | 'about' | 'home' | 'search' | 'other';
  pageId?: string;
  
  // Обезличенные технические данные
  deviceCategory: 'desktop' | 'mobile' | 'tablet';
  screenSize: 'small' | 'medium' | 'large';
  
  // Обезличенная география (только континент)
  region: 'europe' | 'asia' | 'americas' | 'africa' | 'oceania' | 'unknown';
  
  // Обезличенное время
  visitDate: string; // YYYY-MM-DD
  visitHour: number; // 0-23 по МСК
  visitDayOfWeek: number; // 1-7 по МСК
  
  // Поведенческие метрики (без идентификации)
  timeOnPage: number;
  scrollDepth: number;
  clicks: number;
  loadTime: number;
  isBounce: boolean;
  
  // Рекламные метрики
  isFirstVisit: boolean;     // Первый визит по рекламе
  conversionGoal?: string;   // Цель конверсии (регистрация, покупка, etc.)
  conversionValue?: number;  // Стоимость конверсии
  
  // Время и продолжительность
  sessionStart: Date;
  sessionEnd?: Date;
  
  createdAt: Date;
}

const AdvertisingAnalyticsSchema = new Schema<IAdvertisingAnalytics>({
  // Анонимная сессия
  anonymousSessionId: { 
    type: String, 
    required: true, 
    index: true 
  },
  
  // UTM-метки
  utmSource: { type: String, index: true },
  utmMedium: { type: String, index: true },
  utmCampaign: { type: String, index: true },
  utmTerm: { type: String, index: true },
  utmContent: { type: String, index: true },
  
  // Страница
  page: { 
    type: String, 
    required: true, 
    index: true 
  },
  pageType: { 
    type: String, 
    required: true, 
    enum: ['character', 'weapon', 'artifact', 'news', 'about', 'home', 'search', 'other'],
    index: true 
  },
  pageId: { 
    type: String, 
    index: true 
  },
  
  // Обезличенные технические данные
  deviceCategory: { 
    type: String, 
    required: true, 
    enum: ['desktop', 'mobile', 'tablet'],
    index: true 
  },
  screenSize: { 
    type: String, 
    required: true, 
    enum: ['small', 'medium', 'large'],
    index: true 
  },
  
  // Обезличенная география
  region: { 
    type: String, 
    required: true, 
    enum: ['europe', 'asia', 'americas', 'africa', 'oceania', 'unknown'],
    index: true 
  },
  
  // Обезличенное время
  visitDate: { 
    type: String, 
    required: true, 
    index: true 
  },
  visitHour: { 
    type: Number, 
    required: true, 
    index: true 
  },
  visitDayOfWeek: { 
    type: Number, 
    required: true, 
    index: true 
  },
  
  // Поведенческие метрики
  timeOnPage: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 3600
  },
  scrollDepth: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100 
  },
  clicks: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 50
  },
  
  // Производительность
  loadTime: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 30000
  },
  isBounce: { 
    type: Boolean, 
    default: true 
  },
  
  // Рекламные метрики
  isFirstVisit: { 
    type: Boolean, 
    default: true,
    index: true
  },
  conversionGoal: { 
    type: String, 
    index: true 
  },
  conversionValue: { 
    type: Number, 
    min: 0 
  },
  
  // Время сессии
  sessionStart: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  sessionEnd: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
AdvertisingAnalyticsSchema.index({ visitDate: -1 });
AdvertisingAnalyticsSchema.index({ utmSource: 1, visitDate: -1 });
AdvertisingAnalyticsSchema.index({ utmCampaign: 1, visitDate: -1 });
AdvertisingAnalyticsSchema.index({ utmMedium: 1, visitDate: -1 });
AdvertisingAnalyticsSchema.index({ region: 1, visitDate: -1 });
AdvertisingAnalyticsSchema.index({ deviceCategory: 1, visitDate: -1 });
AdvertisingAnalyticsSchema.index({ conversionGoal: 1, visitDate: -1 });

export default mongoose.models.AdvertisingAnalytics || mongoose.model<IAdvertisingAnalytics>('AdvertisingAnalytics', AdvertisingAnalyticsSchema);
