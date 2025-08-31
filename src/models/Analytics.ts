import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  // Основная информация о посещении
  sessionId: string;
  userId?: string; // Если пользователь авторизован
  
  // Информация о странице
  page: string;
  pageType: 'character' | 'weapon' | 'artifact' | 'news' | 'about' | 'home' | 'search' | 'other';
  pageId?: string; // ID конкретного персонажа/оружия/артефакта
  
  // Информация о пользователе
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: 'desktop' | 'mobile' | 'tablet';
  screenResolution: string;
  
  // Географическая информация
  country: string;
  city?: string;
  timezone: string;
  language: string;
  
  // Техническая информация
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  // Время и продолжительность
  timestamp: Date;
  sessionStart: Date;
  sessionEnd?: Date;
  timeOnPage: number; // в секундах
  
  // Дополнительные метрики
  isBounce: boolean; // Пользователь покинул сайт после одной страницы
  scrollDepth: number; // Процент прокрутки страницы (0-100)
  clicks: number; // Количество кликов на странице
  
  // SEO и производительность
  loadTime: number; // Время загрузки страницы в мс
  isFirstVisit: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  
  page: { type: String, required: true, index: true },
  pageType: { 
    type: String, 
    required: true, 
    enum: ['character', 'weapon', 'artifact', 'news', 'about', 'home', 'search', 'other'],
    index: true 
  },
  pageId: { type: String, index: true },
  
  userAgent: { type: String, required: true },
  browser: { type: String, required: true, index: true },
  browserVersion: { type: String, required: true },
  os: { type: String, required: true, index: true },
  osVersion: { type: String, required: true },
  device: { 
    type: String, 
    required: true, 
    enum: ['desktop', 'mobile', 'tablet'],
    index: true 
  },
  screenResolution: { type: String, required: true },
  
  country: { type: String, required: true, index: true },
  city: { type: String, index: true },
  timezone: { type: String, required: true },
  language: { type: String, required: true },
  
  referrer: { type: String },
  utmSource: { type: String },
  utmMedium: { type: String },
  utmCampaign: { type: String },
  
  timestamp: { type: Date, required: true, default: Date.now, index: true },
  sessionStart: { type: Date, required: true, default: Date.now },
  sessionEnd: { type: Date },
  timeOnPage: { type: Number, default: 0 },
  
  isBounce: { type: Boolean, default: true },
  scrollDepth: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  
  loadTime: { type: Number, default: 0 },
  isFirstVisit: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
AnalyticsSchema.index({ timestamp: -1 });
AnalyticsSchema.index({ sessionId: 1, timestamp: -1 });
AnalyticsSchema.index({ pageType: 1, pageId: 1 });
AnalyticsSchema.index({ country: 1, timestamp: -1 });
AnalyticsSchema.index({ device: 1, timestamp: -1 });
AnalyticsSchema.index({ browser: 1, timestamp: -1 });

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
