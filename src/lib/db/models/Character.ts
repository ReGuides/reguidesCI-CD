import mongoose from 'mongoose';

const CharacterSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  name: { 
    type: String, 
    required: true,
    index: true
  },
  image: { 
    type: String 
  },
  element: { 
    type: String,
    enum: ['Pyro', 'Hydro', 'Electro', 'Cryo', 'Anemo', 'Geo', 'Dendro']
  },
  weapon: { 
    type: String,
    enum: ['Sword', 'Claymore', 'Bow', 'Catalyst', 'Polearm']
  },
  region: { 
    type: String 
  },
  rarity: { 
    type: Number,
    min: 4,
    max: 5
  },
  gender: { 
    type: String 
  },
  description: { 
    type: String 
  },
  birthday: { 
    type: String 
  },
  patchNumber: { 
    type: String 
  },
  gameplayDescription: {
    type: String,
    default: ''
  },
  // Дополнительные поля для совместимости с новым интерфейсом
  vision: { 
    type: String 
  },
  constellation: { 
    type: String 
  },
  title: { 
    type: String 
  },
  affiliation: { 
    type: String 
  },
  voiceActor: { 
    type: String 
  },
  voiceActorJp: { 
    type: String 
  },
  voiceActorKr: { 
    type: String 
  },
  voiceActorCn: { 
    type: String 
  },
  baseStats: {
    hp: { type: Number },
    attack: { type: Number },
    defense: { type: Number }
  },
  ascensionStats: {
    hp: { type: Number },
    attack: { type: Number },
    defense: { type: Number },
    critRate: { type: Number },
    critDamage: { type: Number },
    energyRecharge: { type: Number },
    elementalMastery: { type: Number }
  },
  talents: [{
    name: { type: String },
    description: { type: String },
    type: { type: String, enum: ['Normal Attack', 'Elemental Skill', 'Elemental Burst'] }
  }],
  constellations: [{
    name: { type: String },
    description: { type: String },
    level: { type: Number }
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  views: { 
    type: Number, 
    default: 0 
  },
  featured: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

// Индексы для оптимизации запросов
CharacterSchema.index({ element: 1, rarity: 1 });
CharacterSchema.index({ weapon: 1 });
CharacterSchema.index({ region: 1 });
CharacterSchema.index({ featured: 1 });
CharacterSchema.index({ views: -1 });

export const Character = mongoose.models.Character || mongoose.model('Character', CharacterSchema); 