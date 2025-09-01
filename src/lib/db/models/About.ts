import mongoose, { Schema, Document } from 'mongoose';

export interface Statistics {
  characters: number;
  weapons: number;
  artifacts: number;
  builds: number;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface TeamMember {
  name: string;
  role: string;
  description?: string;
  avatar?: string;
  social?: Record<string, string>;
  order: number;
}

export interface ContactInfo {
  email?: string;
  telegram?: string;
  discord?: string;
  vk?: string;
  website?: string;
  description?: string;
}

export interface SocialLinks {
  youtube?: string;
  twitch?: string;
  twitter?: string;
  instagram?: string;
}

export interface IAbout extends Document {
  title: string;
  subtitle?: string;
  description: string;
  features: Feature[];
  statistics: Statistics;
  team: TeamMember[];
  contactInfo: ContactInfo;
  supportProject?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StatisticsSchema = new Schema<Statistics>({
  characters: { type: Number, default: 0 },
  weapons: { type: Number, default: 0 },
  artifacts: { type: Number, default: 0 },
  builds: { type: Number, default: 0 }
});

const FeatureSchema = new Schema<Feature>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, default: 0 }
});

const TeamMemberSchema = new Schema<TeamMember>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String },
  avatar: { type: String },
  social: { type: Schema.Types.Mixed },
  order: { type: Number, default: 0 }
});

const ContactInfoSchema = new Schema<ContactInfo>({
  email: { type: String },
  telegram: { type: String },
  discord: { type: String },
  vk: { type: String },
  website: { type: String },
  description: { type: String }
});

const AboutSchema = new Schema<IAbout>({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String, required: true },
  features: [FeatureSchema],
  statistics: { type: StatisticsSchema, default: () => ({}) },
  team: [TeamMemberSchema],
  contactInfo: { type: ContactInfoSchema, default: () => ({}) },
  supportProject: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const About = mongoose.models.About || mongoose.model<IAbout>('About', AboutSchema); 