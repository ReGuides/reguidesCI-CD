// Character types
export interface Character {
  _id?: string; // MongoDB ObjectId
  id: string;
  name: string;
  image?: string;
  element?: string;
  weapon?: string | Weapon;
  weaponType?: string; // добавлено для админки
  region?: string;
  rarity?: number;
  gender?: string;
  description?: string;
  birthday?: string;
  patchNumber?: string;
  gameplayDescription?: string;
  gameplayDescriptionHtml?: string;
  views?: number;
  isFeatured?: boolean; // добавлено для админки
  role?: string; // добавлено для админки
}

// News types
export interface News {
  _id: string;
  title: string;
  content: string;
  type: 'manual' | 'birthday' | 'update' | 'event' | 'article';
  category: 'news' | 'guide' | 'review' | 'tutorial' | 'event';
  image?: string;
  excerpt?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  characterId?: string;
  characterName?: string;
  characterImage?: string;
  tags: string[];
  views: number;
  author: string;
}

// Advertisement types
export interface Advertisement {
  _id: string;
  title: string;
  description: string;
  cta: string;
  url: string;
  type: 'sidebar' | 'banner' | 'popup';
  isActive: boolean;
  order: number;
  backgroundImage?: string;
  erid?: string;
  deviceTargeting: 'all' | 'desktop' | 'mobile';
  // Новые поля для внешних рекламных сервисов
  adService?: 'yandex_direct' | 'google_ads' | 'custom';
  adServiceCode?: string;
  adServiceId?: string;
  // Статистика показов
  impressions: number;
  clicks: number;
  ctr: number;
  lastShown?: string;
  // Дополнительные настройки
  maxImpressions?: number;
  startDate?: string;
  endDate?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

// Artifact types
export interface Artifact {
  id: string;
  name: string;
  rarity: number[];
  bonus1?: string; // Бонус за 1 предмет (если pieces >= 1)
  bonus2?: string; // Бонус за 2 предмета (если pieces >= 2)
  bonus4?: string; // Бонус за 4 предмета (если pieces >= 4)
  pieces: number; // Количество предметов в сете: 1, 2, 4 или 5
  image?: string; // теперь опционально
  setType?: 'single';
  createdAt?: string;
  updatedAt?: string;
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
  login: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  preferences?: {
    theme: string;
    language: string;
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
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
  login: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  login: string;
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

// Build types
export interface Build {
  _id: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  characterId: string;
  role: 'main_dps' | 'sub_dps' | 'support' | 'healer' | 'waifu' | 'pocket_dps';
  weapons: string[];
  artifacts: ArtifactOrCombination[];
  mainStats: string[];
  subStats: string[];
  talentPriorities: string[];
  teams: string[][];
  filters: string[];
  isFeatured: boolean;
  authorLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Talent {
  _id?: string;
  name: string;
  type: 'normal' | 'skill' | 'burst' | 'passive';
  description: string;
  cooldown?: string;
  energyCost?: number;
  priority?: number;
  scaling?: Record<string, Record<string, string>>;
}

// Global window types for analytics
declare global {
  interface Window {
    trackAdImpression: (adId: string, adType: string, placement: string, adTitle: string) => void;
    trackAdClick: (adId: string, adType: string, placement: string, adTitle: string) => void;
  }
} 