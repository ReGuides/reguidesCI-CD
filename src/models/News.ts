import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INews extends Document {
  title: string;
  content: string;
  type: 'manual' | 'birthday' | 'update' | 'event';
  image?: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  characterId?: mongoose.Types.ObjectId; // Для новостей о персонажах
  tags: string[];
  views: number;
  author: string;
}

// Интерфейс для статических методов
export interface INewsModel extends Model<INews> {
  createBirthdayNews(characterId: string, characterName: string): Promise<INews>;
  hasBirthdayNews(characterId: string, date: Date): Promise<boolean>;
}

const NewsSchema = new Schema<INews>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['manual', 'birthday', 'update', 'event'],
    default: 'manual'
  },
  image: {
    type: String,
    trim: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character'
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  author: {
    type: String,
    default: 'Администратор'
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
NewsSchema.index({ type: 1, isPublished: 1 });
NewsSchema.index({ characterId: 1 });
NewsSchema.index({ publishedAt: -1 });
NewsSchema.index({ tags: 1 });

// Middleware для автоматической установки publishedAt
NewsSchema.pre('save', function(next) {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Статический метод для создания новости о дне рождения
NewsSchema.statics.createBirthdayNews = async function(characterId: string, characterName: string) {
  const birthdayNews = {
    title: `🎉 День рождения ${characterName}!`,
    content: `Сегодня празднует свой день рождения ${characterName}! 🎂\n\nПоздравляем всех поклонников этого персонажа и желаем удачи в игре! 🎮✨`,
    type: 'birthday' as const,
    isPublished: true,
    characterId: new mongoose.Types.ObjectId(characterId),
    tags: ['день рождения', 'праздник', characterName.toLowerCase()],
    author: 'Система'
  };

  return this.create(birthdayNews);
};

// Статический метод для проверки существования новости о дне рождения
NewsSchema.statics.hasBirthdayNews = async function(characterId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.exists({
    characterId: new mongoose.Types.ObjectId(characterId),
    type: 'birthday',
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
};

export default mongoose.models.News || mongoose.model<INews, INewsModel>('News', NewsSchema); 