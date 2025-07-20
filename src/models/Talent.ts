import mongoose from 'mongoose';

export interface ITalent extends mongoose.Document {
  characterId: string;
  talents: Array<{
    _id: mongoose.Types.ObjectId;
    name: string;
    type: string;
    description: string;
    scaling?: object;
  }>;
  updatedAt: Date;
}

const talentSchema = new mongoose.Schema<ITalent>({
  characterId: { type: String, required: true },
  talents: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    scaling: { type: Object, default: {} }
  }],
  updatedAt: { type: Date, default: Date.now }
});

export const TalentModel = mongoose.models.Talent || mongoose.model<ITalent>('Talent', talentSchema); 