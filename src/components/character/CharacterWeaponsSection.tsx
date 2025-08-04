'use client';

import React, { useState, useEffect } from 'react';
import { Weapon, ArtifactOrCombination } from '@/types';
import OptimizedImage from '@/components/ui/optimized-image';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import { Zap, Shield, Heart, Target } from 'lucide-react';

interface CharacterWeaponsSectionProps {
  characterId: string;
}

interface MainStat {
  stat: string;
  targetValue?: string;
  unit?: string;
  description?: string;
  artifactType?: 'sands' | 'goblet' | 'circlet' | 'general';
}

interface TalentPriority {
  talentName: string;
  priority: number;
  description?: string;
}

interface Recommendation {
  weapons: Weapon[];
  artifacts: ArtifactOrCombination[];
  mainStats?: {
    detailedStats?: MainStat[];
    sands?: string[];
    goblet?: string[];
    circlet?: string[];
  };
  subStats?: string[];
  talentPriorities?: TalentPriority[];
  notes?: string;
}

const CharacterWeaponsSection: React.FC<CharacterWeaponsSectionProps> = ({ characterId }) => {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/recommendations/${characterId}`);
        if (response.ok) {
          const data = await response.json();
          setRecommendation(data);
        } else {
          // Если произошла ошибка, устанавливаем пустой объект
          setRecommendation({
            weapons: [],
            artifacts: [],
            mainStats: undefined,
            subStats: [],
            talentPriorities: [],
            notes: undefined
          } as Recommendation);
        }
      } catch (error) {
        console.error('Error fetching recommendation:', error);
        setRecommendation({
          weapons: [],
          artifacts: [],
          mainStats: undefined,
          subStats: [],
          talentPriorities: [],
          notes: undefined
        } as Recommendation);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [characterId]);

  const formatStatValue = (stat: MainStat) => {
    if (!stat.targetValue) return 'Не указано';
    
    const value = stat.targetValue;
    const unit = stat.unit || '';
    
    if (unit === '%') {
      return `${value}%`;
    } else if (unit === 'EM') {
      return `${value} EM`;
    } else if (unit) {
      return `${value} ${unit}`;
    } else {
      return value;
    }
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

  const getStatIcon = (stat: string) => {
    const statLower = stat.toLowerCase();
    if (statLower.includes('хп') || statLower.includes('hp')) return '❤️';
    if (statLower.includes('атака') || statLower.includes('attack')) return '⚔️';
    if (statLower.includes('защита') || statLower.includes('defense')) return '🛡️';
    if (statLower.includes('крит') || statLower.includes('crit')) return '🎯';
    if (statLower.includes('энергия') || statLower.includes('energy')) return '⚡';
    if (statLower.includes('мастерство') || statLower.includes('elemental')) return '🌟';
    if (statLower.includes('лечение') || statLower.includes('healing')) return '💚';
    return '📊';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-700 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-neutral-700 rounded"></div>
              ))}
            </div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-700 rounded mb-4"></div>
            <div className="h-32 bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendation || (!recommendation.weapons.length && !recommendation.artifacts.length && !recommendation.mainStats && !recommendation.subStats?.length)) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка: Оружия и Артефакты */}
          <div>
            {/* Оружия */}
            <div>
              <h2 className="block text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-text">
                Рекомендуемое оружие
              </h2>
              <div className="text-center text-gray-400 py-8">
                <Zap className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                Рекомендации по оружию пока не настроены
              </div>
            </div>

            {/* Артефакты */}
            <div>
              <h2 className="block text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-text">
                Рекомендуемые артефакты
              </h2>
              <div className="text-center text-gray-400 py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                Рекомендации по артефактам пока не настроены
              </div>
            </div>
          </div>

          {/* Правая колонка: Статы */}
          <div>
            <div className="bg-card border border-neutral-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Рекомендуемые статы</h3>
              <div className="text-center text-gray-400 py-8">
                <Heart className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                Статы для этого персонажа пока не настроены
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка: Оружия и Артефакты */}
        <div className="space-y-8">
          {/* Оружия */}
          <div>
            <h2 className="block text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-text">
              Рекомендуемое оружие
            </h2>
            {recommendation.weapons.length > 0 ? (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 px-2">
                {recommendation.weapons.map((weapon, idx) => {
                  if (!weapon || typeof weapon !== 'object' || !('name' in weapon) || !('id' in weapon)) {
                    return (
                      <div key={idx} className="text-red-400">Ошибка данных оружия</div>
                    );
                  }
                  // Убеждаемся, что у нас есть уникальный строковый ключ
                  let weaponKey;
                  if (typeof weapon.id === 'object' && weapon.id !== null) {
                    // Если id является объектом MongoDB, используем индекс
                    weaponKey = `weapon-obj-${idx}`;
                  } else {
                    // Если id является примитивом, используем его строковое представление
                    weaponKey = `weapon-${weapon.id?.toString() || idx}`;
                  }
                  return (
                    <div key={weaponKey} className="flex flex-col items-center p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors min-h-[140px]">
                      <OptimizedImage
                        src={getImageWithFallback(weapon.image, weapon.name, 'weapon')}
                        alt={weapon.name?.toString() || 'Оружие'}
                        className="w-16 h-16 rounded mb-3"
                        type="weapon"
                      />
                      <div className="text-center w-full">
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <span className="text-yellow-400 text-sm">★{Number(weapon.rarity)}</span>
                        </div>
                        <p className="text-white text-xs font-medium leading-tight mb-1 min-h-[2.5rem] flex items-center justify-center">
                          {weapon.name?.toString() || 'Не указано'}
                        </p>
                        <p className="text-gray-400 text-xs">{weapon.type?.toString() || 'Не указано'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Zap className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                Рекомендации по оружию пока не настроены
              </div>
            )}
          </div>

          {/* Артефакты */}
          <div>
            <h2 className="block text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-text">
              Рекомендуемые артефакты
            </h2>
            {recommendation.artifacts.length > 0 ? (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 px-2">
                {recommendation.artifacts.map((artifact, index) => {
                  // Проверяем тип артефакта
                  if (artifact.setType === 'combination' && 'sets' in artifact && artifact.sets) {
                    // Комбинация сетов (например, 2+2)
                    return (
                      <div key={`combination-${index}`} className="flex flex-col items-center p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors min-h-[140px]">
                        <div className="grid grid-cols-2 gap-1 mb-3 w-16 h-16">
                          {artifact.sets.map((set: { id: string; name: string; image?: string }, setIndex: number) => {
                            // Убеждаемся, что все поля являются примитивами
                            const cleanSet = {
                              id: set.id?.toString() || '',
                              name: set.name?.toString() || '',
                              image: set.image?.toString() || ''
                            };
                            // Убеждаемся, что у нас есть уникальный строковый ключ
                            let setKey;
                            if (typeof cleanSet.id === 'object' && cleanSet.id !== null) {
                              // Если id является объектом MongoDB, используем индекс
                              setKey = `set-obj-${setIndex}`;
                            } else {
                              // Если id является примитивом, используем его строковое представление
                              setKey = `set-${cleanSet.id}-${setIndex}`;
                            }
                            return (
                              <OptimizedImage
                                key={setKey}
                                src={getImageWithFallback(cleanSet.image, cleanSet.name, 'artifact')}
                                alt={cleanSet.name}
                                className="w-full h-full rounded"
                                type="artifact"
                              />
                            );
                          })}
                        </div>
                        <div className="text-center w-full">
                          <p className="text-white text-xs font-medium leading-tight mb-2 min-h-[2.5rem] flex items-center justify-center">
                            2+2
                          </p>
                          <p className="text-gray-400 text-xs">Комбинация</p>
                        </div>
                      </div>
                    );
                  } else if (artifact.setType === 'single') {
                    // Одиночный сет
                    // Убеждаемся, что у нас есть уникальный строковый ключ
                    let artifactKey;
                    if (typeof artifact.id === 'object' && artifact.id !== null) {
                      // Если id является объектом MongoDB, используем индекс
                      artifactKey = `single-obj-${index}`;
                    } else {
                      // Если id является примитивом, используем его строковое представление
                      artifactKey = `single-${artifact.id?.toString() || artifact.name?.toString() || index}`;
                    }
                    return (
                      <div key={artifactKey} className="flex flex-col items-center p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors min-h-[140px]">
                        <OptimizedImage
                          src={getImageWithFallback(artifact.image, artifact.name, 'artifact')}
                          alt={artifact.name?.toString() || 'Артефакт'}
                          className="w-16 h-16 rounded mb-3"
                          type="artifact"
                        />
                        <div className="text-center w-full">
                          <p className="text-white text-xs font-medium leading-tight mb-2 min-h-[2.5rem] flex items-center justify-center">
                            {artifact.name?.toString() || 'Не указано'}
                          </p>
                        </div>
                      </div>
                    );
                  } else if ('id' in artifact && 'name' in artifact && !artifact.setType) {
                    // Обычный артефакт (для обратной совместимости) - без setType
                    // Убеждаемся, что у нас есть уникальный строковый ключ
                    let regularArtifactKey;
                    if (typeof artifact.id === 'object' && artifact.id !== null) {
                      // Если id является объектом MongoDB, используем индекс
                      regularArtifactKey = `regular-obj-${index}`;
                    } else {
                      // Если id является примитивом, используем его строковое представление
                      regularArtifactKey = `regular-${artifact.id?.toString() || artifact.name?.toString() || index}`;
                    }
                    return (
                      <div key={regularArtifactKey} className="flex flex-col items-center p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors min-h-[140px]">
                        <OptimizedImage
                          src={getImageWithFallback(artifact.image, artifact.name, 'artifact')}
                          alt={artifact.name?.toString() || 'Артефакт'}
                          className="w-16 h-16 rounded mb-3"
                          type="artifact"
                        />
                        <div className="text-center w-full">
                          <p className="text-white text-xs font-medium leading-tight mb-2 min-h-[2.5rem] flex items-center justify-center">
                            {artifact.name?.toString() || 'Не указано'}
                          </p>
                        </div>
                      </div>
                    );
                  } else {
                    // Неизвестный тип артефакта
                    return (
                      <div key={`unknown-${index}`} className="flex flex-col items-center p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors min-h-[140px]">
                        <div className="text-center w-full">
                          <p className="text-white text-xs font-medium leading-tight mb-2 min-h-[2.5rem] flex items-center justify-center">
                            Неизвестный тип артефакта
                          </p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                Рекомендации по артефактам пока не настроены
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка: Статы */}
        <div>
          <div className="bg-card border border-neutral-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Рекомендуемые статы
            </h3>
            
            {/* Детальные статы */}
            {recommendation.mainStats?.detailedStats && recommendation.mainStats.detailedStats.length > 0 ? (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Целевые характеристики
                </h5>
                <div className="grid gap-2">
                  {recommendation.mainStats.detailedStats.map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getStatIcon(stat.stat)}</span>
                        <span className="font-medium text-white">{formatStatName(stat.stat)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{formatStatValue(stat)}</div>
                        {stat.description && (
                          <div className="text-xs text-gray-400 mt-1 max-w-48 text-right">
                            {stat.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Базовые статы артефактов */}
            {recommendation.mainStats && (recommendation.mainStats.sands?.length || recommendation.mainStats.goblet?.length || recommendation.mainStats.circlet?.length) ? (
              <div className="space-y-3 mt-4">
                <h5 className="text-sm font-medium text-gray-300 mb-2">Основные статы артефактов</h5>
                <div className="space-y-2 text-sm">
                  {recommendation.mainStats.sands && recommendation.mainStats.sands.length > 0 && (
                    <div className="flex justify-between items-center p-2 bg-neutral-800 rounded">
                      <span className="text-gray-400">Пески времени:</span>
                      <span className="text-white">{recommendation.mainStats.sands.map(stat => formatStatName(stat)).join(', ')}</span>
                    </div>
                  )}
                  {recommendation.mainStats.goblet && recommendation.mainStats.goblet.length > 0 && (
                    <div className="flex justify-between items-center p-2 bg-neutral-800 rounded">
                      <span className="text-gray-400">Кубок:</span>
                      <span className="text-white">{recommendation.mainStats.goblet.map(stat => formatStatName(stat)).join(', ')}</span>
                    </div>
                  )}
                  {recommendation.mainStats.circlet && recommendation.mainStats.circlet.length > 0 && (
                    <div className="flex justify-between items-center p-2 bg-neutral-800 rounded">
                      <span className="text-gray-400">Корона:</span>
                      <span className="text-white">{recommendation.mainStats.circlet.map(stat => formatStatName(stat)).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Дополнительные статы */}
            {recommendation.subStats && recommendation.subStats.length > 0 && (
              <div className="space-y-3 mt-4">
                <h5 className="text-sm font-medium text-gray-300 mb-2">Дополнительные статы</h5>
                <div className="flex flex-wrap gap-2">
                  {recommendation.subStats.map((stat, statIndex) => (
                    <span key={`stat-${statIndex}-${stat?.toString() || ''}`} className="px-3 py-1 bg-neutral-700 rounded text-xs text-white">
                      {formatStatName(stat)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Приоритеты талантов */}
            {recommendation.talentPriorities && recommendation.talentPriorities.length > 0 && (
              <div className="space-y-3 mt-4">
                <h5 className="text-sm font-medium text-gray-300 mb-2">Приоритеты прокачки талантов</h5>
                <div className="space-y-2">
                  {recommendation.talentPriorities
                    .sort((a, b) => a.priority - b.priority)
                    .map((talent, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-neutral-800 rounded">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          talent.priority === 1 ? 'bg-red-500/20 text-red-400' :
                          talent.priority === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {talent.priority}
                        </span>
                        <span className="text-white text-sm">{formatTalentName(talent.talentName)}</span>
                        {talent.description && (
                          <span className="text-gray-400 text-xs ml-auto">({talent.description})</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Заметки */}
            {recommendation.notes && (
              <div className="space-y-3 mt-4">
                <h5 className="text-sm font-medium text-gray-300 mb-2">Заметки</h5>
                <p className="text-sm text-gray-400 bg-neutral-800 rounded-lg p-3">
                  {recommendation.notes}
                </p>
              </div>
            )}

            {/* Если нет никаких данных */}
            {!recommendation.mainStats?.detailedStats && 
             !recommendation.mainStats?.sands && 
             !recommendation.mainStats?.goblet && 
             !recommendation.mainStats?.circlet && 
             !recommendation.subStats?.length && 
             !recommendation.talentPriorities?.length && 
             !recommendation.notes && (
              <div className="text-center text-gray-400 py-8">
                <Heart className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                Статы для этого персонажа пока не настроены
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterWeaponsSection; 