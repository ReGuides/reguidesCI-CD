import mongoose from 'mongoose';

export interface IArtifactOrCombination {
  setType: 'single' | 'combination';
  id?: string;
  name?: string;
  image?: string;
  rarity?: number[];
  bonus2?: string;
  bonus4?: string;
  statFields?: string[];
  sets?: Array<{
    id: string;
    name: string;
    image?: string;
  }>;
  description?: string;
}

export interface IBuild extends mongoose.Document {
  title: string;
  description?: string;
  characterId: string;
  role: 'main_dps' | 'sub_dps' | 'support' | 'healer' | 'waifu' | 'pocket_dps';
  weapons: string[];
  artifacts: IArtifactOrCombination[];
  mainStats: string[];
  subStats: string[];
  talentPriorities: string[];
  teams: string[][];
  filters: string[];
  isFeatured: boolean;
  authorLogin?: string;
  createdAt: Date;
  updatedAt: Date;
}

const artifactOrCombinationSchema = new mongoose.Schema({
  setType: { 
    type: String, 
    enum: ['single', 'combination'], 
    required: true 
  },
  id: { type: String },
  name: { type: String },
  image: { type: String },
  rarity: { type: [Number] },
  bonus2: { type: String },
  bonus4: { type: String },
  statFields: { type: [String] },
  sets: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String }
  }],
  description: { type: String }
}, { _id: false });

const buildSchema = new mongoose.Schema<IBuild>({
  title: { type: String, required: true },
  description: { type: String },
  characterId: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['main_dps', 'sub_dps', 'support', 'healer', 'waifu', 'pocket_dps']
  },
  weapons: { type: [String], default: [] },
  artifacts: { type: [artifactOrCombinationSchema], default: [] },
  mainStats: { type: [String], default: [] },
  subStats: { type: [String], default: [] },
  talentPriorities: { type: [String], default: [] },
  teams: { type: [[String]], default: [] },
  filters: { type: [String], default: [] },
  isFeatured: { type: Boolean, default: false },
  authorLogin: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

buildSchema.index({ characterId: 1 });

export const BuildModel = mongoose.models.Build || mongoose.model<IBuild>('Build', buildSchema); 