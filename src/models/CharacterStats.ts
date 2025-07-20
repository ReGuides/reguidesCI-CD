import mongoose from 'mongoose';

export interface ICharacterStat {
  stat: string;
  targetValue?: string;
  unit?: string;
  description?: string;
  artifactType?: 'sands' | 'goblet' | 'circlet' | 'general';
}

export interface ITalentPriority {
  talentName: string;
  priority: number;
  description?: string;
}

export interface ICharacterStats extends mongoose.Document {
  characterId: string;
  mainStats: ICharacterStat[];
  mainStatSands: string[];
  mainStatGoblet: string[];
  mainStatCirclet: string[];
  subStats: string[];
  talentPriorities: ITalentPriority[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const characterStatSchema = new mongoose.Schema<ICharacterStat>({
  stat: { type: String, required: true },
  targetValue: { type: String },
  unit: { type: String },
  description: { type: String },
  artifactType: { 
    type: String, 
    enum: ['sands', 'goblet', 'circlet', 'general'], 
    default: 'general' 
  }
});

const talentPrioritySchema = new mongoose.Schema<ITalentPriority>({
  talentName: { type: String, required: true },
  priority: { type: Number, required: true },
  description: { type: String }
});

const characterStatsSchema = new mongoose.Schema<ICharacterStats>({
  characterId: { type: String, required: true, unique: true },
  mainStats: [characterStatSchema],
  mainStatSands: [{ type: String }],
  mainStatGoblet: [{ type: String }],
  mainStatCirclet: [{ type: String }],
  subStats: [{ type: String }],
  talentPriorities: [talentPrioritySchema],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Обновляем updatedAt при каждом сохранении
characterStatsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const CharacterStatsModel = mongoose.models.CharacterStats || mongoose.model<ICharacterStats>('CharacterStats', characterStatsSchema); 