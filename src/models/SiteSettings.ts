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
  contacts: {
    email?: string;
    telegram?: string;
    discord?: string;
    vk?: string;
    website?: string;
    description?: string;
  };
  sitemap: {
    includeAllCharacters: boolean; // Включать всех персонажей в sitemap или только активных
    lastUpdated?: Date;
    forceUpdate?: boolean;
  };
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
  
  // Контактная информация
  contacts: {
    email: { type: String },
    telegram: { type: String },
    discord: { type: String },
    vk: { type: String },
    website: { type: String },
    description: { type: String }
  },
  
  // Настройки sitemap
  sitemap: {
    includeAllCharacters: { type: Boolean, default: true },
    lastUpdated: { type: Date },
    forceUpdate: { type: Boolean, default: false }
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
        team: [],
        contacts: {
          email: '',
          telegram: '',
          discord: '',
          vk: '',
          website: '',
          description: 'Свяжитесь с нами для получения дополнительной информации о проекте.'
        }
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
