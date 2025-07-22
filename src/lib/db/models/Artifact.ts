import mongoose, { Schema } from 'mongoose';

export interface IArtifact {
  _id?: string;
  id?: string; // Для совместимости со старой базой данных
  name: string;
  set: string;
  rarity: number[];
  piece: 'Flower of Life' | 'Plume of Death' | 'Sands of Eon' | 'Goblet of Eonothem' | 'Circlet of Logos';
  mainStat: string;
  subStats?: string[];
  description?: string;
  image?: string;
  setBonus?: Array<{
    pieces: number;
    description: string;
  }>;
  location?: string;
  isActive?: boolean;
  views?: number;
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ArtifactSchema = new Schema<IArtifact>({
  id: { type: String, unique: true, sparse: true }, // Для совместимости со старой базой данных
  name: { type: String, required: true },
  set: { type: String, required: true },
  rarity: {
    type: [Number],
    required: true,
    validate: {
      validator: function(rarity) {
        return Array.isArray(rarity) && rarity.every(r => r >= 1 && r <= 5);
      },
      message: 'Редкость должна быть от 1 до 5'
    }
  },
  piece: { 
    type: String, 
    required: true,
    enum: ['Flower of Life', 'Plume of Death', 'Sands of Eon', 'Goblet of Eonothem', 'Circlet of Logos']
  },
  mainStat: { type: String, required: true },
  subStats: [{ type: String }],
  description: { type: String },
  image: { type: String },
  setBonus: [{
    pieces: { type: Number, required: true },
    description: { type: String, required: true }
  }],
  location: { type: String },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Индексы для оптимизации запросов
ArtifactSchema.index({ name: 1 });
ArtifactSchema.index({ set: 1 });
ArtifactSchema.index({ piece: 1 });
ArtifactSchema.index({ rarity: 1 });
ArtifactSchema.index({ isActive: 1 });
ArtifactSchema.index({ featured: 1 });
ArtifactSchema.index({ views: -1 });

// Middleware для обновления updatedAt
ArtifactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Artifact = mongoose.models.Artifact || mongoose.model<IArtifact>('Artifact', ArtifactSchema); 