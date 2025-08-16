import mongoose from 'mongoose';

export interface IArtifact extends mongoose.Document {
  id: string;
  name: string;
  rarity: number[];
  bonus1?: string;
  bonus2?: string;
  bonus4?: string;
  pieces: number;
  image: string;
}

const artifactSchema = new mongoose.Schema<IArtifact>({
  id: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-z0-9-]+$/
  },
  name: {
    type: String,
    required: true
  },
  rarity: {
    type: [Number],
    required: true,
    validate: {
      validator: function(rarity: number[]) {
        return rarity.every(r => r >= 1 && r <= 5);
      },
      message: 'Редкость должна быть от 1 до 5'
    }
  },
  bonus1: { type: String },
  bonus2: { type: String },
  bonus4: { type: String },
  pieces: { 
    type: Number, 
    required: true,
    enum: [1, 2, 4, 5], // Только допустимые значения
    default: 5
  },
  image: {
    type: String,
    required: true,
    match: /\.(webp|png|jpg|jpeg)$/
  }
});

export const ArtifactModel = mongoose.models.Artifact || mongoose.model<IArtifact>('Artifact', artifactSchema); 