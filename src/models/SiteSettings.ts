import mongoose from 'mongoose';

export interface TeamMember {
  userId: string;        // ID пользователя из коллекции users (строка)
  role: string;          // Роль в команде
  description?: string;  // Описание участника
  order: number;         // Порядок отображения
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
  userId: { type: String, required: true },  // ID пользователя как строка
  role: { type: String, required: true },    // Роль в команде
  description: { type: String },             // Описание
  order: { type: Number, default: 0 }        // Порядок
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
  
  // Команда разработчиков (массив пользователей с ролями)
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
  try {
    let settings = await this.findOne();
    if (!settings) {
      settings = await this.create({
        siteName: 'ReGuides',
        logo: '/images/logos/logo.png',
        favicon: '/favicon.ico',
        team: []
      });
    }
    return settings;
  } catch (error) {
    console.error('Error in getSettings:', error);
    throw error;
  }
};

const SiteSettings = mongoose.models.SiteSettings as ISiteSettingsModel || 
  mongoose.model<ISiteSettings, ISiteSettingsModel>('SiteSettings', siteSettingsSchema);

export default SiteSettings;
