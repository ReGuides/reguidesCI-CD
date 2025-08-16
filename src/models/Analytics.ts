import mongoose from 'mongoose';

// Схема для отслеживания просмотров страниц
const pageViewSchema = new mongoose.Schema({
  url: { type: String, required: true, index: true },
  title: { type: String, required: true },
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  ip: { type: String, required: true },
  userAgent: { type: String },
  referrer: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  timeOnPage: { type: Number, default: 0 }, // в секундах
  isBounce: { type: Boolean, default: true }
}, { timestamps: true });

// Схема для отслеживания событий
const eventSchema = new mongoose.Schema({
  eventType: { type: String, required: true, index: true }, // 'click', 'search', 'download', etc.
  eventName: { type: String, required: true },
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  ip: { type: String, required: true },
  url: { type: String, required: true },
  elementId: { type: String }, // ID элемента, на который кликнули
  elementText: { type: String }, // Текст элемента
  metadata: { type: mongoose.Schema.Types.Mixed }, // Дополнительные данные
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Схема для отслеживания поисковых запросов
const searchQuerySchema = new mongoose.Schema({
  query: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  ip: { type: String, required: true },
  resultsCount: { type: Number, default: 0 },
  clickedResult: { type: String }, // ID результата, на который кликнули
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Схема для агрегированной статистики по дням
const dailyStatsSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  totalPageViews: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  averageSessionDuration: { type: Number, default: 0 }, // в секундах
  bounceRate: { type: Number, default: 0 }, // процент
  topPages: [{ 
    url: String, 
    views: Number 
  }],
  topSearchQueries: [{ 
    query: String, 
    count: Number 
  }],
  topReferrers: [{ 
    referrer: String, 
    count: Number 
  }],
  deviceTypes: {
    desktop: { type: Number, default: 0 },
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 }
  },
  browsers: { type: Map, of: Number, default: new Map() },
  operatingSystems: { type: Map, of: Number, default: new Map() },
  countries: { type: Map, of: Number, default: new Map() },
  averageLoadTime: { type: Number, default: 0 }
}, { timestamps: true });

// Схема для отслеживания пользовательских сессий
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, index: true },
  ip: { type: String, required: true },
  userAgent: { type: String },
  referrer: { type: String },
  startTime: { type: Date, required: true, index: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // в секундах
  pageViews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
  browser: { type: String },
  operatingSystem: { type: String },
  country: { type: String },
  city: { type: String },
  language: { type: String }
}, { timestamps: true });

// Индексы для оптимизации запросов
pageViewSchema.index({ timestamp: -1, url: 1 });
pageViewSchema.index({ sessionId: 1, timestamp: -1 });
eventSchema.index({ timestamp: -1, eventType: 1 });
searchQuerySchema.index({ timestamp: -1, query: 1 });
sessionSchema.index({ startTime: -1, isActive: 1 });

// TTL индексы для автоматической очистки старых данных (90 дней)
pageViewSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
eventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
searchQuerySchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
sessionSchema.index({ startTime: 1 }, { expireAfterSeconds: 7776000 });

export const PageViewModel = mongoose.models.PageView || mongoose.model('PageView', pageViewSchema);
export const EventModel = mongoose.models.Event || mongoose.model('Event', eventSchema);
export const SearchQueryModel = mongoose.models.SearchQuery || mongoose.model('SearchQuery', searchQuerySchema);
export const DailyStatsModel = mongoose.models.DailyStats || mongoose.model('DailyStats', dailyStatsSchema);
export const SessionModel = mongoose.models.Session || mongoose.model('Session', sessionSchema);
