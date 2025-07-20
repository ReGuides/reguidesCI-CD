import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string; // Изменено с description на excerpt
  content: string;
  contentPath?: string;
  type: 'guide' | 'article' | 'quest' | 'tutorial';
  category: string;
  tags: string[];
  author: {
    _id: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
  status: 'draft' | 'published' | 'archived'; // Добавлено поле status
  isPublished: boolean;
  publishedAt?: Date;
  featuredImage?: string;
  images: string[];
  seoTitle?: string;
  seoDescription?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
  prerequisites?: string[];
  relatedArticles?: string[];
  views: number;
  rating?: number;
  isRichEditor?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String },
  username: { type: String },
  avatar: { type: String }
});

const ArticleSchema = new Schema<IArticle>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true }, // Изменено с description на excerpt
  content: { type: String, required: true },
  contentPath: { type: String },
  type: { 
    type: String, 
    required: true, 
    enum: ['guide', 'article', 'quest', 'tutorial'],
    default: 'article'
  },
  category: { type: String, required: true },
  tags: [{ type: String }],
  author: { type: AuthorSchema, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  featuredImage: { type: String },
  images: [{ type: String }],
  seoTitle: { type: String },
  seoDescription: { type: String },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  estimatedTime: { type: Number, default: 0 },
  prerequisites: [{ type: String }],
  relatedArticles: [{ type: String }],
  views: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  isRichEditor: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Индексы для поиска
ArticleSchema.index({ title: 'text', excerpt: 'text', content: 'text' }); // Изменено с description на excerpt
ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ status: 1 }); // Добавлен индекс для status
ArticleSchema.index({ isPublished: 1 });
ArticleSchema.index({ type: 1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ views: -1 });
ArticleSchema.index({ publishedAt: -1 });

export const Article = mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema); 