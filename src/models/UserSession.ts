import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  // Уникальный идентификатор сессии (хешированный)
  sessionId: string;
  
  // Первое посещение
  firstVisit: Date;
  
  // Последнее посещение
  lastVisit: Date;
  
  // Количество посещений в этой сессии
  visitCount: number;
  
  // Общее время на сайте (в секундах)
  totalTimeOnSite: number;
  
  // Количество просмотренных страниц
  pageViews: number;
  
  // Обезличенная техническая информация
  deviceCategory: 'desktop' | 'mobile' | 'tablet';
  screenSize: 'small' | 'medium' | 'large';
  region: 'europe' | 'asia' | 'americas' | 'africa' | 'oceania' | 'unknown';
  
  // Поведенческие метрики
  isReturning: boolean; // Возвращающийся пользователь
  isEngaged: boolean; // Вовлеченный пользователь (время > 30 сек ИЛИ > 2 страниц)
  engagementScore: number; // Оценка вовлеченности (0-100)
  
  // Последняя страница
  lastPage: string;
  lastPageType: 'character' | 'weapon' | 'artifact' | 'news' | 'about' | 'home' | 'search' | 'other';
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>({
  sessionId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  
  firstVisit: { 
    type: Date, 
    required: true,
    index: true 
  },
  
  lastVisit: { 
    type: Date, 
    required: true,
    index: true 
  },
  
  visitCount: { 
    type: Number, 
    default: 1,
    min: 1 
  },
  
  totalTimeOnSite: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  
  pageViews: { 
    type: Number, 
    default: 1,
    min: 1 
  },
  
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
  
  region: { 
    type: String, 
    required: true, 
    enum: ['europe', 'asia', 'americas', 'africa', 'oceania', 'unknown'],
    index: true 
  },
  
  isReturning: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  
  isEngaged: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  
  engagementScore: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100,
    index: true 
  },
  
  lastPage: { 
    type: String, 
    required: true 
  },
  
  lastPageType: { 
    type: String, 
    required: true, 
    enum: ['character', 'weapon', 'artifact', 'news', 'about', 'home', 'search', 'other'],
    index: true 
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
UserSessionSchema.index({ firstVisit: -1 });
UserSessionSchema.index({ lastVisit: -1 });
UserSessionSchema.index({ region: 1, lastVisit: -1 });
UserSessionSchema.index({ deviceCategory: 1, lastVisit: -1 });
UserSessionSchema.index({ isReturning: 1, lastVisit: -1 });
UserSessionSchema.index({ isEngaged: 1, lastVisit: -1 });

// Middleware для обновления меток времени
UserSessionSchema.pre('save', function(next) {
  this.lastVisit = new Date();
  next();
});

export default mongoose.models.UserSession || mongoose.model<IUserSession>('UserSession', UserSessionSchema);
