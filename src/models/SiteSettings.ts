import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  // Основные настройки
  siteName: {
    type: String,
    required: true,
    default: 'ReGuides'
  },
  siteDescription: {
    type: String,
    required: true,
    default: 'Лучшие гайды по Genshin Impact'
  },
  logo: {
    type: String,
    default: '/images/logos/logo.png'
  },
  favicon: {
    type: String,
    default: '/favicon.ico'
  },
  
  // SEO настройки
  seo: {
    defaultTitle: {
      type: String,
      required: true,
      default: 'ReGuides - Гайды по Genshin Impact'
    },
    defaultDescription: {
      type: String,
      required: true,
      default: 'Подробные гайды по персонажам, оружию и артефактам Genshin Impact'
    },
    googleAnalyticsId: {
      type: String,
      default: ''
    },
    metaKeywords: {
      type: String,
      default: 'genshin impact, гайды, персонажи, оружие, артефакты'
    }
  },
  
  // Социальные сети
  social: {
    telegram: {
      type: String,
      default: ''
    },
    discord: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    },
    vk: {
      type: String,
      default: ''
    }
  },
  
  // Функции сайта
  features: {
    r34Mode: {
      type: Boolean,
      default: false
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    registrationEnabled: {
      type: Boolean,
      default: true
    },
    commentsEnabled: {
      type: Boolean,
      default: true
    },
    searchEnabled: {
      type: Boolean,
      default: true
    }
  },
  
  // Настройки контента
  content: {
    maxCharactersPerPage: {
      type: Number,
      default: 20
    },
    maxWeaponsPerPage: {
      type: Number,
      default: 24
    },
    maxArtifactsPerPage: {
      type: Number,
      default: 24
    },
    enableCharacterBuilds: {
      type: Boolean,
      default: true
    },
    enableWeaponComparison: {
      type: Boolean,
      default: true
    }
  },
  
  // Настройки уведомлений
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: false
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    birthdayReminders: {
      type: Boolean,
      default: true
    }
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
siteSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;
