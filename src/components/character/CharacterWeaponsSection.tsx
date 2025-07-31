'use client';

import React, { useState, useEffect } from 'react';
import { Weapon, ArtifactOrCombination } from '@/types';
import OptimizedImage from '@/components/ui/optimized-image';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import { Zap, Shield, Heart } from 'lucide-react';

interface CharacterWeaponsSectionProps {
  characterId: string;
}

interface Recommendation {
  weapons: Weapon[];
  artifacts: ArtifactOrCombination[]; // Используем правильный тип для артефактов
  mainStats?: {
    sands: string;
    goblet: string;
    circlet: string;
  };
  subStats?: string[];
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
        } else if (response.status === 404) {
          // Рекомендации не найдены - это нормально
          setRecommendation(null);
        }
      } catch (error) {
        console.error('Error fetching recommendation:', error);
        setRecommendation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [characterId]);

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

  if (!recommendation) {
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
                {recommendation.weapons.map((weapon) => (
                  <div key={weapon.id} className="flex flex-col items-center p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors min-h-[140px]">
                    <OptimizedImage
                      src={getImageWithFallback(weapon.image, weapon.name, 'weapon')}
                      alt={weapon.name}
                      className="w-16 h-16 rounded mb-3"
                      type="weapon"
                    />
                    <div className="text-center w-full">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <span className="text-yellow-400 text-sm">★{weapon.rarity}</span>
                      </div>
                      <p className="text-white text-xs font-medium leading-tight mb-1 min-h-[2.5rem] flex items-center justify-center">
                        {weapon.name}
                      </p>
                      <p className="text-gray-400 text-xs">{weapon.type}</p>
                    </div>
                  </div>
                ))}
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
                          {artifact.sets.map((set: { id: string; name: string; image?: string }, setIndex: number) => (
                            <OptimizedImage
                              key={setIndex}
                              src={getImageWithFallback(set.image, set.name, 'artifact')}
                              alt={set.name}
                              className="w-full h-full rounded"
                              type="artifact"
                            />
                          ))}
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
                    return (
                      <div key={`single-${artifact.name || index}`} className="flex flex-col items-center p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors min-h-[140px]">
                        <OptimizedImage
                          src={getImageWithFallback(artifact.image, artifact.name, 'artifact')}
                          alt={artifact.name}
                          className="w-16 h-16 rounded mb-3"
                          type="artifact"
                        />
                        <div className="text-center w-full">
                          <p className="text-white text-xs font-medium leading-tight mb-2 min-h-[2.5rem] flex items-center justify-center">
                            {artifact.name}
                          </p>
                        </div>
                      </div>
                    );
                  } else if ('id' in artifact && 'name' in artifact && !artifact.setType) {
                    // Обычный артефакт (для обратной совместимости) - без setType
                    return (
                      <div key={`regular-${artifact.id || artifact.name || index}`} className="flex flex-col items-center p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors min-h-[140px]">
                        <OptimizedImage
                          src={getImageWithFallback(artifact.image, artifact.name, 'artifact')}
                          alt={artifact.name}
                          className="w-16 h-16 rounded mb-3"
                          type="artifact"
                        />
                        <div className="text-center w-full">
                          <p className="text-white text-xs font-medium leading-tight mb-2 min-h-[2.5rem] flex items-center justify-center">
                            {artifact.name}
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
            <h3 className="text-lg font-semibold mb-4 text-white">Рекомендуемые статы</h3>
            {recommendation.mainStats || recommendation.subStats ? (
              <div className="space-y-4">
                {recommendation.mainStats && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Основные статы</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Пески времени:</span>
                        <span className="text-white">{recommendation.mainStats.sands || 'Не указано'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Кубок:</span>
                        <span className="text-white">{recommendation.mainStats.goblet || 'Не указано'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Корона:</span>
                        <span className="text-white">{recommendation.mainStats.circlet || 'Не указано'}</span>
                      </div>
                    </div>
                  </div>
                )}
                {recommendation.subStats && recommendation.subStats.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Дополнительные статы</h5>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.subStats.map((stat, statIndex) => (
                        <span key={statIndex} className="px-2 py-1 bg-neutral-700 rounded text-xs text-white">
                          {stat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {recommendation.notes && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Заметки</h5>
                    <p className="text-sm text-gray-400 bg-neutral-800 rounded-lg p-3">
                      {recommendation.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
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