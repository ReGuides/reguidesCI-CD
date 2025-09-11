import mongoose from 'mongoose';

export interface ICharacter extends mongoose.Document {
  id: string;
  name: string;
  image?: string;
  element?: string;
  weapon?: string;
  weaponType?: string;
  region?: string;
  rarity?: number;
  gender?: string;
  description?: string;
  birthday?: string;
  patchNumber?: string;
  gameplayDescription?: string;
  gameplayDescriptionHtml?: string;
  views?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  role?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const characterSchema = new mongoose.Schema<ICharacter>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String },
  element: { type: String },
  weapon: { type: String },
  weaponType: { type: String },
  region: { type: String },
  rarity: { type: Number },
  gender: { type: String },
  description: { type: String },
  birthday: { type: String },
  patchNumber: { type: String },
  gameplayDescription: {
    type: String,
    default: ''
  },
  gameplayDescriptionHtml: {
    type: String,
    default: ''
  },
  views: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  role: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const CharacterModel = mongoose.models.Character || mongoose.model<ICharacter>('Character', characterSchema); 