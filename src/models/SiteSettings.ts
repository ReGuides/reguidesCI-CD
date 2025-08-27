import mongoose from 'mongoose';

export interface TeamMember {
  name: string;
  role: string;
  description?: string;
  avatar?: string;
  social?: Record<string, string>;
  order: number;
}

export interface ISiteSettings {
  siteName: string;
  logo?: string;
  favicon?: string;
  team: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

interface ISiteSettingsModel extends mongoose.Model<ISiteSettings> {
  getSettings(): Promise<ISiteSettings>;
}

const teamMemberSchema = new mongoose.Schema<TeamMember>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String },
  avatar: { type: String },
  social: { type: mongoose.Schema.Types.Mixed },
  order: { type: Number, default: 0 }
});

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
  
  // Команда разработчиков
  team: {
    type: [teamMemberSchema],
    default: []
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
