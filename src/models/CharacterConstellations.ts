import mongoose, { Schema, Document } from 'mongoose';

export interface IConstellation {
  name: string;
  level: number;
  description: string;
  effect?: string;
  priority?: number;
}

export interface IConstellationPriority {
  constellationName: string;
  priority: number;
  description?: string;
}

export interface ICharacterConstellations extends Document {
  characterId: string;
  constellations: IConstellation[];
  priorities: IConstellationPriority[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConstellationSchema = new Schema<IConstellation>({
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  description: {
    type: String,
    required: true
  },
  effect: String,
  priority: Number
});

const ConstellationPrioritySchema = new Schema<IConstellationPriority>({
  constellationName: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    required: true
  },
  description: String
});

const CharacterConstellationsSchema = new Schema<ICharacterConstellations>({
  characterId: {
    type: String,
    required: true,
    index: true
  },
  constellations: [ConstellationSchema],
  priorities: [ConstellationPrioritySchema],
  notes: String
}, {
  timestamps: true
});

export const CharacterConstellationsModel = mongoose.models.CharacterConstellations || 
  mongoose.model<ICharacterConstellations>('CharacterConstellations', CharacterConstellationsSchema); 