import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  // Анонимная информация о посещении (без персональных данных)
  anonymousSessionId: string; // Хешированный ID сессии
  
  // Информация о странице
  page: string;
  pageType: 'character' | 'weapon' | 'artifact' | 'news' | 'about' | 'home' | 'search' | 'other';
  pageId?: string; // ID конкретного персонажа/оружия/артефакта
  
  // ОБЕЗЛИЧЕННАЯ техническая информация (не идентифицирует пользователя)
  deviceCategory: 'desktop' | 'mobile' | 'tablet'; // Только категория устройства
  screenSize: 'small' | 'medium' | 'large'; // Обезличенный размер экрана
  
  // ОБЕЗЛИЧЕННАЯ географическая информация (без точных данных)
  region: 'europe' | 'asia' | 'americas' | 'africa' | 'oceania' | 'unknown'; // Только континент
  
  // Время и продолжительность (обезличенные)
  visitDate: string; // Только дата в формате YYYY-MM-DD (без времени)
  visitHour: number; // Час посещения (0-23) по МСК
  visitDayOfWeek: number; // День недели (1-7) по МСК
  
  // Поведенческие метрики (без идентификации)
  timeOnPage: number; // Время на странице в секундах (округленное)
  scrollDepth: number; // Процент прокрутки (0-100)
  clicks: number; // Количество кликов (0-10+)
  
  // SEO и производительность
  loadTime: number; // Время загрузки в мс (округленное)
  isBounce: boolean; // Отказ (без привязки к конкретному пользователю)
  
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  // Анонимная сессия (хешированная)
  anonymousSessionId: { 
    type: String, 
    required: true, 
    index: true 
  },
  
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
    max: 3600 // Максимум 1 час
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
    max: 50 // Максимум 50 кликов
  },
  
  // Производительность
  loadTime: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 30000 // Максимум 30 секунд
  },
  isBounce: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
AnalyticsSchema.index({ visitDate: -1 });
AnalyticsSchema.index({ visitHour: 1 });
AnalyticsSchema.index({ visitDayOfWeek: 1 });
AnalyticsSchema.index({ pageType: 1, pageId: 1 });
AnalyticsSchema.index({ region: 1, visitDate: -1 });
AnalyticsSchema.index({ deviceCategory: 1, visitDate: -1 });

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
