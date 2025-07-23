// Character types
export interface Character {
  _id?: string; // MongoDB ObjectId
  id: string;
  name: string;
  image?: string;
  element?: string;
  weapon?: string;
  weaponType?: string; // добавлено для админки
  region?: string;
  rarity?: number;
  gender?: string;
  description?: string;
  birthday?: string;
  patchNumber?: string;
  gameplayDescription?: string;
  views?: number;
  isFeatured?: boolean; // добавлено для админки
  role?: string; // добавлено для админки
}

// News types
export interface News {
  _id: string;
  title: string;
  content: string;
  summary: string;
  preview?: string;
  date?: string;
  author?: string;
  type?: 'genshin' | 'general';
  image?: string;
  featured?: boolean;
  publishedAt?: string;
  isPublished?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Advertisement types
export interface Advertisement {
  _id: string;
  title: string;
  description: string;
  url: string;
  backgroundImage?: string;
  cta: string;
  type: string;
  erid?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// About types
export interface About {
  _id: string;
  title: string;
  content: string;
  supportProject?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Character Stats types
export interface CharacterStat {
  stat: string;
  targetValue?: string;
  unit?: string;
  description?: string;
  artifactType?: 'sands' | 'goblet' | 'circlet' | 'general';
}

export interface TalentPriority {
  talentName: string;
  priority: number;
  description?: string;
}

export interface CharacterStats {
  characterId: string;
  mainStats: CharacterStat[];
  mainStatSands: string[];
  mainStatGoblet: string[];
  mainStatCirclet: string[];
  subStats: string[];
  talentPriorities: TalentPriority[];
  notes?: string;
}

// Character Teams types
export interface TeamPosition {
  characters: string[];
}

export interface RecommendedTeam {
  positions: {
    main_dps: TeamPosition;
    sub_dps: TeamPosition;
    support: TeamPosition;
    healer: TeamPosition;
  };
  notes?: string;
}

export interface CompatibleCharacter {
  characterId: string;
}

export interface CharacterTeams {
  characterId: string;
  recommendedTeams: RecommendedTeam[];
  compatibleCharacters: CompatibleCharacter[];
  notes?: string;
}

// Weapon types
export interface Weapon {
  id: string;
  name: string;
  type: string;
  rarity: number;
  baseAttack: string;
  subStatName: string;
  subStatValue: string;
  passiveName: string;
  passiveEffect: string;
  image?: string; // теперь опционально
}

// Artifact types
export interface Artifact {
  id: string;
  name: string;
  rarity: number[];
  bonus1?: string;
  bonus2?: string;
  bonus4?: string;
  pieces: number;
  image?: string; // теперь опционально
  setType?: 'single';
}

export interface ArtifactCombination {
  setType: 'combination';
  sets: Artifact[];
  description: string;
}

export interface StatCombination {
  setType: 'combination';
  type: 'stat+stat';
  statFields: string[];
  description: string;
}

export interface ArtifactStatCombination {
  setType: 'combination';
  sets: Artifact[];
  statField: string;
  description: string;
}

export type ArtifactOrCombination = Artifact | ArtifactCombination | StatCombination | ArtifactStatCombination;

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
  isActive?: boolean;
  lastLogin?: string;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
  favorites: {
    characters: string[];
    weapons: string[];
    artifacts: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

// Article types
export interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string | User;
  category: 'guide' | 'news' | 'review' | 'analysis';
  tags?: string[];
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  views: number;
  likes: number;
  featured: boolean;
  relatedArticles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter types
export interface CharacterFilters {
  element?: string;
  rarity?: number;
  weapon?: string;
  region?: string;
  search?: string;
}

export interface WeaponFilters {
  type?: string;
  rarity?: number;
  search?: string;
}

export interface ArtifactFilters {
  rarity?: number;
  search?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Site Settings types
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    googleAnalyticsId?: string;
  };
  social: {
    telegram?: string;
    discord?: string;
    twitter?: string;
  };
  features: {
    r34Mode: boolean;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  };
} 