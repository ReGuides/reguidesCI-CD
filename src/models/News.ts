import mongoose from 'mongoose';

export interface INews extends mongoose.Document {
  title: string;
  content: string;
  summary: string;
  image?: string;
  author: string;
  publishedAt: string;
  isPublished: boolean;
  tags: string[];
  type?: 'genshin' | 'other';
  date?: string;
  preview?: string;
  createdAt: Date;
  updatedAt: Date;
}

const newsSchema = new mongoose.Schema<INews>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, required: true },
  image: { type: String },
  author: { type: String, required: true },
  publishedAt: { type: String, required: true },
  isPublished: { type: Boolean, default: true },
  tags: [{ type: String }],
  type: { 
    type: String, 
    enum: ['genshin', 'other'], 
    default: 'genshin' 
  },
  date: { type: String },
  preview: { type: String }
}, {
  timestamps: true
});

export const NewsModel = mongoose.models.News || mongoose.model<INews>('News', newsSchema); 