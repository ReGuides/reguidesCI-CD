import mongoose, { Schema } from 'mongoose';

export interface IWeapon {
  _id?: string;
  id?: string; // Для совместимости со старой базой данных
  name: string;
  type: 'Sword' | 'Claymore' | 'Bow' | 'Catalyst' | 'Polearm';
  rarity: 3 | 4 | 5;
  baseAttack: number;
  secondaryStat?: string;
  secondaryStatValue?: number;
  description?: string;
  image?: string;
  passive?: string;
  refinement?: Array<{
    level: number;
    description: string;
  }>;
  location?: string;
  isActive?: boolean;
  views?: number;
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const WeaponSchema = new Schema<IWeapon>({
  id: { type: String, unique: true, sparse: true }, // Для совместимости со старой базой данных
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Sword', 'Claymore', 'Bow', 'Catalyst', 'Polearm']
  },
  rarity: { 
    type: Number, 
    required: true,
    enum: [3, 4, 5]
  },
  baseAttack: { type: Number, required: true },
  secondaryStat: { type: String },
  secondaryStatValue: { type: Number },
  description: { type: String },
  image: { type: String },
  passive: { type: String },
  refinement: [{
    level: { type: Number, required: true },
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
WeaponSchema.index({ name: 1 });
WeaponSchema.index({ type: 1 });
WeaponSchema.index({ rarity: 1 });
WeaponSchema.index({ isActive: 1 });
WeaponSchema.index({ featured: 1 });
WeaponSchema.index({ views: -1 });

// Middleware для обновления updatedAt
WeaponSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Weapon = mongoose.models.Weapon || mongoose.model<IWeapon>('Weapon', WeaponSchema); 