import mongoose from 'mongoose';

export interface ITeamPosition {
  characters: string[];
}

export interface IRecommendedTeam {
  positions: {
    main_dps: ITeamPosition;
    sub_dps: ITeamPosition;
    support: ITeamPosition;
    healer: ITeamPosition;
  };
  notes?: string;
}

export interface ICompatibleCharacter {
  characterId: string;
}

export interface ICharacterTeams extends mongoose.Document {
  characterId: string;
  recommendedTeams: IRecommendedTeam[];
  compatibleCharacters: ICompatibleCharacter[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const teamPositionSchema = new mongoose.Schema<ITeamPosition>({
  characters: [{ type: String }]
});

const recommendedTeamSchema = new mongoose.Schema<IRecommendedTeam>({
  positions: {
    main_dps: teamPositionSchema,
    sub_dps: teamPositionSchema,
    support: teamPositionSchema,
    healer: teamPositionSchema
  },
  notes: { type: String }
});

const compatibleCharacterSchema = new mongoose.Schema<ICompatibleCharacter>({
  characterId: { type: String, required: true }
});

const characterTeamsSchema = new mongoose.Schema<ICharacterTeams>({
  characterId: { type: String, required: true, unique: true },
  recommendedTeams: [recommendedTeamSchema],
  compatibleCharacters: [compatibleCharacterSchema],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Обновляем updatedAt при каждом сохранении
characterTeamsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const CharacterTeamsModel = mongoose.models.CharacterTeams || mongoose.model<ICharacterTeams>('CharacterTeams', characterTeamsSchema); 