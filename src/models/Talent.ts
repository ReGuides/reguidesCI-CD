import mongoose from 'mongoose';

const talentSchema = new mongoose.Schema({
  characterId: { type: String, required: true },
  talents: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    cooldown: { type: String },
    energyCost: { type: Number },
    priority: { type: Number },
    scaling: { type: Object, default: {} }
  }],
  priorities: [{
    talentName: { type: String, required: true },
    priority: { type: Number, required: true },
    description: { type: String }
  }],
  notes: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

export const Talent = mongoose.models.Talent || mongoose.model('Talent', talentSchema); 