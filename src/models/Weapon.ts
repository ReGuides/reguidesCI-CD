import mongoose from 'mongoose';

export interface IWeapon extends mongoose.Document {
  id: string;
  name: string;
  type: string;
  rarity: number;
  baseAttack: string;
  subStatName: string;
  subStatValue: string;
  passiveName: string;
  passiveEffect: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const weaponSchema = new mongoose.Schema<IWeapon>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  rarity: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  baseAttack: {
    type: String,
    required: true
  },
  subStatName: {
    type: String,
    required: true
  },
  subStatValue: {
    type: String,
    required: true
  },
  passiveName: {
    type: String,
    required: true
  },
  passiveEffect: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const WeaponModel = mongoose.models.Weapon || mongoose.model<IWeapon>('Weapon', weaponSchema); 