import mongoose from 'mongoose';

export interface IAdvertisement extends mongoose.Document {
  title: string;
  description: string;
  cta: string;
  url: string;
  type: 'sidebar' | 'banner' | 'popup';
  isActive: boolean;
  order: number;
  backgroundImage?: string;
  erid?: string;
  deviceTargeting: 'all' | 'desktop' | 'mobile';
  // Новые поля для внешних рекламных сервисов
  adService?: 'yandex_direct' | 'google_ads' | 'custom';
  adServiceCode?: string; // HTML код от рекламного сервиса
  adServiceId?: string; // ID рекламы в сервисе
  // Статистика показов
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  lastShown?: Date;
  // Дополнительные настройки
  maxImpressions?: number; // Максимальное количество показов
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const advertisementSchema = new mongoose.Schema<IAdvertisement>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  cta: { type: String, required: true },
  url: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['sidebar', 'banner', 'popup'],
    default: 'sidebar'
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  backgroundImage: { type: String },
  erid: { type: String },
  deviceTargeting: { 
    type: String, 
    required: true,
    enum: ['all', 'desktop', 'mobile'],
    default: 'all'
  },
  // Новые поля для внешних рекламных сервисов
  adService: { 
    type: String, 
    enum: ['yandex_direct', 'google_ads', 'custom'],
    default: 'custom'
  },
  adServiceCode: { type: String }, // HTML код от рекламного сервиса
  adServiceId: { type: String }, // ID рекламы в сервисе
  // Статистика показов
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  ctr: { type: Number, default: 0 }, // Click-through rate
  lastShown: { type: Date },
  // Дополнительные настройки
  maxImpressions: { type: Number }, // Максимальное количество показов
  startDate: { type: Date },
  endDate: { type: Date }
}, {
  timestamps: true
});

// Middleware для автоматического расчета CTR
advertisementSchema.pre('save', function(next) {
  if (this.impressions > 0) {
    this.ctr = (this.clicks / this.impressions) * 100;
  }
  next();
});

export const AdvertisementModel = mongoose.models.Advertisement || mongoose.model<IAdvertisement>('Advertisement', advertisementSchema); 