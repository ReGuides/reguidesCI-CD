import mongoose, { Schema, Document } from 'mongoose';

export interface ICharacterRecommendation extends Document {
  characterId: string;
  weapons: string[];
  artifacts: string[];
  mainStatSands: string[];
  mainStatGoblet: string[];
  mainStatCirclet: string[];
  subStats: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CharacterRecommendationSchema = new Schema<ICharacterRecommendation>({
  characterId: {
    type: String,
    required: true,
    index: true
  },
  weapons: [{
    type: String,
    default: []
  }],
  artifacts: [{
    type: String,
    default: []
  }],
  mainStatSands: [{
    type: String,
    default: []
  }],
  mainStatGoblet: [{
    type: String,
    default: []
  }],
  mainStatCirclet: [{
    type: String,
    default: []
  }],
  subStats: [{
    type: String,
    default: []
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

export const CharacterRecommendationModel = mongoose.models.CharacterRecommendation || 
  mongoose.model<ICharacterRecommendation>('CharacterRecommendation', CharacterRecommendationSchema); 