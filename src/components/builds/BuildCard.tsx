'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Shield, Target, Users, Star, ChevronDown, ChevronUp } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { WeaponModal } from '@/components/weapon-modal';
import { ArtifactModal } from '@/components/artifact-modal';
import { TalentModal } from '@/components/talent-modal';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import { Weapon, Artifact, Talent } from '@/types';

interface BuildCardProps {
  build: {
    _id: string;
    title: string;
    description?: string;
    role: string;
    weapons: string[];
    artifacts: Array<{
      setType: 'single' | 'combination';
      id?: string;
      name?: string;
      image?: string;
      rarity?: number[];
    }>;
    mainStats: string[];
    subStats: string[];
    talentPriorities: string[];
    isFeatured?: boolean;
  };
  index: number;
}

const BuildCard: React.FC<BuildCardProps> = ({ build, index }) => {
  const [weaponsData, setWeaponsData] = useState<Weapon[]>([]);
  const [loadingWeapons, setLoadingWeapons] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [isWeaponModalOpen, setIsWeaponModalOpen] = useState(false);
  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(index !== 0);

  useEffect(() => {
    const fetchWeapons = async () => {
      if (build.weapons.length === 0) return;
      
      try {
        setLoadingWeapons(true);
        const response = await fetch('/api/weapons');
        if (response.ok) {
          const allWeapons = await response.json();
          const buildWeapons = allWeapons.filter((weapon: Weapon) => 
            build.weapons.includes(weapon.id)
          );
          setWeaponsData(buildWeapons);
        }
      } catch (error) {
        console.error('Error fetching weapons:', error);
      } finally {
        setLoadingWeapons(false);
      }
    };

    fetchWeapons();
  }, [build.weapons]);

  const handleItemClick = async (type: string, id: string) => {
    try {
      if (type === 'weapon') {
        const response = await fetch(`/api/weapons/${id}`);
        if (response.ok) {
          const weapon = await response.json();
          setSelectedWeapon(weapon);
          setIsWeaponModalOpen(true);
        } else {
          console.error('BuildCard failed to fetch weapon:', response.status, response.statusText);
        }
      } else if (type === 'artifact') {
        const response = await fetch(`/api/artifacts/${id}`);
        if (response.ok) {
          const artifact = await response.json();
          setSelectedArtifact(artifact);
          setIsArtifactModalOpen(true);
        } else {
          console.error('BuildCard failed to fetch artifact:', response.status, response.statusText);
        }
      } else if (type === 'talent') {
        const response = await fetch(`/api/talents/${id}`);
        if (response.ok) {
          const talent = await response.json();
          setSelectedTalent(talent);
          setIsTalentModalOpen(true);
        } else {
          console.error('BuildCard failed to fetch talent:', response.status, response.statusText);
        }
      } else if (type === 'character') {
        // Для персонажей перенаправляем на страницу персонажа
        window.location.href = `/characters/${id}`;
      }
    } catch (error) {
      console.error('BuildCard error fetching item data:', error);
    }
  };

  const closeWeaponModal = () => {
    setIsWeaponModalOpen(false);
    setSelectedWeapon(null);
  };

  const closeArtifactModal = () => {
    setIsArtifactModalOpen(false);
    setSelectedArtifact(null);
  };

  const closeTalentModal = () => {
    setIsTalentModalOpen(false);
    setSelectedTalent(null);
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: { [key: string]: string } = {
      'main_dps': 'Основной ДПС',
      'sub_dps': 'Второстепенный ДПС',
      'support': 'Поддержка',
      'healer': 'Лекарь',
      'waifu': 'Ваифу',
      'pocket_dps': 'Карманный ДПС'
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors: { [key: string]: string } = {
      'main_dps': 'bg-red-500/20 text-red-400',
      'sub_dps': 'bg-orange-500/20 text-orange-400',
      'support': 'bg-blue-500/20 text-blue-400',
      'healer': 'bg-green-500/20 text-green-400',
      'waifu': 'bg-pink-500/20 text-pink-400',
      'pocket_dps': 'bg-purple-500/20 text-purple-400'
    };
    return roleColors[role] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatColor = (stat: string) => {
    const statColors: { [key: string]: string } = {
      // Основные статы
      'hp': 'bg-red-500/20 text-red-400',
      'hp_percent': 'bg-red-500/20 text-red-400',
      'atk': 'bg-orange-500/20 text-orange-400',
      'atk_percent': 'bg-orange-500/20 text-orange-400',
      'def': 'bg-yellow-500/20 text-yellow-400',
      'def_percent': 'bg-yellow-500/20 text-yellow-400',
      'elemental_mastery': 'bg-green-500/20 text-green-400',
      'energy_recharge': 'bg-blue-500/20 text-blue-400',
      'crit_rate': 'bg-purple-500/20 text-purple-400',
      'crit_dmg': 'bg-purple-500/20 text-purple-400',
      
      // Элементальные статы
      'pyro_dmg_bonus': 'bg-red-500/20 text-red-400',
      'cryo_dmg_bonus': 'bg-blue-500/20 text-blue-400',
      'hydro_dmg_bonus': 'bg-cyan-500/20 text-cyan-400',
      'electro_dmg_bonus': 'bg-purple-500/20 text-purple-400',
      'dendro_dmg_bonus': 'bg-green-500/20 text-green-400',
      'anemo_dmg_bonus': 'bg-emerald-500/20 text-emerald-400',
      'geo_dmg_bonus': 'bg-yellow-500/20 text-yellow-400',
      'physical_dmg_bonus': 'bg-gray-500/20 text-gray-400',
      
      // Сокращенные названия
      'hp%': 'bg-red-500/20 text-red-400',
      'atk%': 'bg-orange-500/20 text-orange-400',
      'def%': 'bg-yellow-500/20 text-yellow-400',
      'em': 'bg-green-500/20 text-green-400',
      'er': 'bg-blue-500/20 text-blue-400',
      'cr': 'bg-purple-500/20 text-purple-400',
      'cd': 'bg-purple-500/20 text-purple-400',
      'crit': 'bg-purple-500/20 text-purple-400'
    };
    return statColors[stat.toLowerCase()] || 'bg-gray-500/20 text-gray-400';
  };

  const formatStatName = (stat: string) => {
    const statNames: { [key: string]: string } = {
      'hp': 'HP',
      'hp_percent': 'HP%',
      'atk': 'Сила атаки',
      'atk_percent': 'Сила атаки%',
      'def': 'Защита',
      'def_percent': 'Защита%',
      'elemental_mastery': 'Мастерство стихий',
      'energy_recharge': 'Восстановление энергии',
      'crit_rate': 'Шанс крит. попадания',
      'crit_dmg': 'Крит. урон',
      'pyro_dmg_bonus': 'Бонус Пиро урона',
      'cryo_dmg_bonus': 'Бонус Крио урона',
      'hydro_dmg_bonus': 'Бонус Гидро урона',
      'electro_dmg_bonus': 'Бонус Электро урона',
      'dendro_dmg_bonus': 'Бонус Дендро урона',
      'anemo_dmg_bonus': 'Бонус Анемо урона',
      'geo_dmg_bonus': 'Бонус Гео урона',
      'physical_dmg_bonus': 'Бонус физ. урона',
      'hp%': 'HP%',
      'atk%': 'Сила атаки%',
      'def%': 'Защита%',
      'em': 'Мастерство стихий',
      'er': 'Восстановление энергии',
      'cr': 'Шанс крит. попадания',
      'cd': 'Крит. урон',
      'crit': 'Крит'
    };
    return statNames[stat.toLowerCase()] || stat;
  };

  const getTalentColor = (talent: string) => {
    const talentColors: { [key: string]: string } = {
      'normal': 'bg-blue-500/20 text-blue-400',
      'skill': 'bg-green-500/20 text-green-400',
      'burst': 'bg-purple-500/20 text-purple-400',
      'passive': 'bg-yellow-500/20 text-yellow-400',
      'auto': 'bg-blue-500/20 text-blue-400',
      'e': 'bg-green-500/20 text-green-400',
      'q': 'bg-purple-500/20 text-purple-400',
      'basic': 'bg-blue-500/20 text-blue-400',
      'elemental': 'bg-green-500/20 text-green-400',
      'ultimate': 'bg-purple-500/20 text-purple-400'
    };
    return talentColors[talent.toLowerCase()] || 'bg-gray-500/20 text-gray-400';
  };

  const formatTalentName = (talent: string) => {
    const talentNames: { [key: string]: string } = {
      'normal': 'Обычная атака',
      'skill': 'Элементальный навык',
      'burst': 'Взрыв стихии',
      'passive': 'Пассивный талант',
      'auto': 'Обычная атака',
      'e': 'Элементальный навык',
      'q': 'Взрыв стихии',
      'basic': 'Обычная атака',
      'elemental': 'Элементальный навык',
      'ultimate': 'Взрыв стихии'
    };
    return talentNames[talent.toLowerCase()] || talent;
  };

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-750 transition-colors">
      {/* Заголовок и кнопка сворачивания */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-6 flex items-center justify-between hover:bg-neutral-750 transition-colors"
      >
        <div className="flex items-start justify-between flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {build.isFeatured && (
                <Star className="w-4 h-4 text-yellow-400" />
              )}
              <h3 className="text-lg font-semibold text-white">{build.title}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(build.role)}`}>
                {getRoleLabel(build.role)}
              </span>
            </div>
          </div>
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-5 h-5 text-gray-400 ml-4" />
        ) : (
          <ChevronUp className="w-5 h-5 text-gray-400 ml-4" />
        )}
      </button>

      {/* Свернутый контент */}
      {!isCollapsed && (
        <div className="px-6 pb-6">
          {/* Описание */}
          {build.description && (
            <div className="mb-4">
              <MarkdownRenderer content={build.description} onItemClick={handleItemClick} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Левая колонка: Оружия и Артефакты */}
            <div className="space-y-4">
              {/* Оружия */}
              {build.weapons.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-medium text-gray-300">Оружия</h4>
                  </div>
                  {loadingWeapons ? (
                    <div className="flex flex-wrap gap-2">
                      {build.weapons.map((weaponId, idx) => (
                        <span key={idx} className="px-2 py-1 bg-neutral-700 rounded text-xs text-white">
                          {weaponId}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {weaponsData.map((weapon, idx) => (
                        <div key={idx} className="flex flex-col items-center p-2 bg-neutral-700 rounded">
                          <OptimizedImage
                            src={getImageWithFallback(weapon.image, weapon.name, 'weapon')}
                            alt={weapon.name}
                            className="w-8 h-8 rounded mb-1"
                            type="weapon"
                          />
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-yellow-400 text-xs">★{weapon.rarity}</span>
                          </div>
                          <span className="text-xs text-gray-300 text-center leading-tight">
                            {weapon.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Артефакты */}
              {build.artifacts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-green-400" />
                    <h4 className="text-sm font-medium text-gray-300">Артефакты</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {build.artifacts.map((artifact, idx) => (
                      <div key={idx} className="flex flex-col items-center p-2 bg-neutral-700 rounded">
                        <OptimizedImage
                          src={getImageWithFallback(artifact.image, artifact.name || 'artifact', 'artifact')}
                          alt={artifact.name || 'Артефакт'}
                          className="w-8 h-8 rounded mb-1"
                          type="artifact"
                        />
                        <span className="text-xs text-gray-300 text-center leading-tight">
                          {artifact.name || artifact.id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Правая колонка: Статы и приоритеты */}
            <div className="space-y-4">
              {/* Основные статы */}
              {build.mainStats.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-red-400" />
                    <h4 className="text-sm font-medium text-gray-300">Основные статы</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {build.mainStats.map((stat, idx) => (
                      <span key={idx} className={`px-2 py-1 rounded text-xs font-medium ${getStatColor(stat)}`}>
                        {formatStatName(stat)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Дополнительные статы */}
              {build.subStats.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-medium text-gray-300">Дополнительные статы</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {build.subStats.map((stat, idx) => (
                      <span key={idx} className={`px-2 py-1 rounded text-xs font-medium ${getStatColor(stat)}`}>
                        {formatStatName(stat)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Приоритеты талантов */}
              {build.talentPriorities.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-yellow-400" />
                    <h4 className="text-sm font-medium text-gray-300">Приоритеты талантов</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {build.talentPriorities.map((talent, idx) => (
                      <span key={idx} className={`px-2 py-1 rounded text-xs font-medium ${getTalentColor(talent)}`}>
                        {formatTalentName(talent)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <WeaponModal
        isOpen={isWeaponModalOpen}
        onClose={closeWeaponModal}
        weapon={selectedWeapon}
      />
      <ArtifactModal
        isOpen={isArtifactModalOpen}
        onClose={closeArtifactModal}
        artifact={selectedArtifact}
      />
      <TalentModal
        talent={selectedTalent}
        isOpen={isTalentModalOpen}
        onClose={closeTalentModal}
      />
    </div>
  );
};

export default BuildCard; 