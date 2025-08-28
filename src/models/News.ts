import mongoose, { Schema, Document, Model } from 'mongoose';
import { getRandomBirthdayMessage } from '@/lib/utils/birthdayMessages';

export interface INews extends Document {
  title: string;
  content: string;
  type: 'manual' | 'birthday' | 'update' | 'event' | 'article';
  category: 'news' | 'guide' | 'review' | 'tutorial' | 'event';
  image?: string;
  excerpt?: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  characterId?: mongoose.Types.ObjectId; // Для новостей о персонажах
  characterName?: string; // Имя персонажа для отображения
  characterImage?: string; // Изображение персонажа
  tags: string[];
  views: number;
  author: string;
}

// Интерфейс для статических методов
export interface INewsModel extends Model<INews> {
  createBirthdayNews(characterId: string, characterName: string, characterImage?: string): Promise<INews>;
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
    enum: ['manual', 'birthday', 'update', 'event', 'article'],
    default: 'manual'
  },
  category: {
    type: String,
    enum: ['news', 'guide', 'review', 'tutorial', 'event'],
    default: 'news'
  },
  image: {
    type: String,
    trim: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: 300
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
  characterName: {
    type: String,
    trim: true
  },
  characterImage: {
    type: String,
    trim: true
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
NewsSchema.statics.createBirthdayNews = async function(characterId: string, characterName: string, characterImage?: string) {
  // Получаем случайное поздравление
  const birthdayMessage = getRandomBirthdayMessage(characterName, characterId);
  
  const birthdayNews = {
    title: `🎉 День рождения ${characterName}!`,
    content: birthdayMessage.content,
    type: 'birthday' as const,
    isPublished: true,
    characterId: new mongoose.Types.ObjectId(characterId),
    characterName: characterName,
    characterImage: characterImage,
    // Устанавливаем основное изображение новости как изображение персонажа
    image: characterImage ? `/images/characters/${characterImage}` : undefined,
    tags: birthdayMessage.tags,
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