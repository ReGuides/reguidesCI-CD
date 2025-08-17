import mongoose from 'mongoose';

export interface IAdvertisement extends mongoose.Document {
  title: string;
  description: string;
  cta: string;
  url: string;
  type: 'sidebar' | 'banner' | 'popup';
  isActive: boolean;
  order: number;
  backgroundImage?: string;
  erid?: string;
  createdAt: Date;
  updatedAt: Date;
}

const advertisementSchema = new mongoose.Schema<IAdvertisement>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  cta: { type: String, required: true },
  url: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['sidebar', 'banner', 'popup'],
    default: 'sidebar'
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  backgroundImage: { type: String },
  erid: { type: String }
}, {
  timestamps: true
});

export const AdvertisementModel = mongoose.models.Advertisement || mongoose.model<IAdvertisement>('Advertisement', advertisementSchema); 