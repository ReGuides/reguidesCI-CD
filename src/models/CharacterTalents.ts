import mongoose, { Schema, Document } from 'mongoose';

export interface ITalent {
  name: string;
  type: 'normal' | 'skill' | 'burst';
  description: string;
  cooldown?: string;
  energyCost?: number;
  priority?: number;
}

export interface ITalentPriority {
  talentName: string;
  priority: number;
  description?: string;
}

export interface ICharacterTalents extends Document {
  characterId: string;
  talents: ITalent[];
  priorities: ITalentPriority[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TalentSchema = new Schema<ITalent>({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['normal', 'skill', 'burst'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  cooldown: String,
  energyCost: Number,
  priority: Number
});

const TalentPrioritySchema = new Schema<ITalentPriority>({
  talentName: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    required: true
  },
  description: String
});

const CharacterTalentsSchema = new Schema<ICharacterTalents>({
  characterId: {
    type: String,
    required: true,
    index: true
  },
  talents: [TalentSchema],
  priorities: [TalentPrioritySchema],
  notes: String
}, {
  timestamps: true
});

export const CharacterTalentsModel = mongoose.models.CharacterTalents || 
  mongoose.model<ICharacterTalents>('CharacterTalents', CharacterTalentsSchema); 