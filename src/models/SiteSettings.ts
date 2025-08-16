import mongoose from 'mongoose';

interface ISiteSettings {
  siteName: string;
  logo?: string;
  favicon?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ISiteSettingsModel extends mongoose.Model<ISiteSettings> {
  getSettings(): Promise<ISiteSettings>;
}

const siteSettingsSchema = new mongoose.Schema<ISiteSettings>({
  // Основные настройки
  siteName: {
    type: String,
    required: true,
    default: 'ReGuides'
  },
  logo: {
    type: String,
    default: '/images/logos/logo.png'
  },
  favicon: {
    type: String,
    default: '/favicon.ico'
  },
  
  // Метаданные
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Обновляем updatedAt при каждом изменении
siteSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Создаем единственный документ настроек
siteSettingsSchema.statics.getSettings = async function(): Promise<ISiteSettings> {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const SiteSettings = mongoose.models.SiteSettings as ISiteSettingsModel || 
  mongoose.model<ISiteSettings, ISiteSettingsModel>('SiteSettings', siteSettingsSchema);

export default SiteSettings;
