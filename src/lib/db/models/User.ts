import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  login: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  avatar: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { 
    type: Date 
  },
  preferences: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'ru' },
    notifications: { type: Boolean, default: true }
  },
  favorites: {
    characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],
    weapons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Weapon' }],
    artifacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artifact' }]
  }
}, {
  timestamps: true
});

// Индексы для оптимизации запросов
UserSchema.index({ login: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

export const User = mongoose.models.User || mongoose.model('User', UserSchema); 