import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String },
  username: { type: String },
  avatar: { type: String }
});

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['guide', 'article', 'quest', 'tutorial'],
    default: 'article'
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: { type: authorSchema, required: true },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  featuredImage: {
    type: String
  },
  images: [{
    type: String
  }],
  seoTitle: {
    type: String
  },
  seoDescription: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  estimatedTime: {
    type: Number,
    default: 0
  },
  prerequisites: [{
    type: String
  }],
  relatedArticles: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  isRichEditor: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Индексы для поиска
articleSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
articleSchema.index({ slug: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ isPublished: 1 });
articleSchema.index({ type: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ views: -1 });
articleSchema.index({ publishedAt: -1 });

export const ArticleModel = mongoose.models.Article || mongoose.model('Article', articleSchema); 