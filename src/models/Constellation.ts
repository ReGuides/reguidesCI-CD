import mongoose from 'mongoose';

export interface IConstellation extends mongoose.Document {
  characterId: string;
  constellations: Array<{
    level: number;
    name: string;
    description: string;
  }>;
  updatedAt: Date;
}

const constellationSchema = new mongoose.Schema<IConstellation>({
  characterId: { type: String, required: true },
  constellations: [{
    level: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true }
  }],
  updatedAt: { type: Date, default: Date.now }
});

export const ConstellationModel = mongoose.models.Constellation || mongoose.model<IConstellation>('Constellation', constellationSchema); 