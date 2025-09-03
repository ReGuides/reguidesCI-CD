import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/ui/optimized-image';
import { Artifact, ArtifactOrCombination, Weapon } from '@/types';
import { WeaponSelectModal } from './WeaponSelectModal';
import { ArtifactSelectModal } from './ArtifactSelectModal';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import CharacterStatsManager from '@/components/admin/CharacterStatsManager';
import CharacterTeamsManager from '@/components/admin/CharacterTeamsManager';

interface RecommendationFormProps {
  initial?: {
    weapons?: (string | Weapon)[];
    artifacts?: ArtifactOrCombination[];
  };
  onCancel: () => void;
  onSave: (recommendation: {
    weapons: (string | Weapon)[];
    artifacts: ArtifactOrCombination[];
  }) => void;
  characterWeaponType?: string;
  characterId?: string;
}

export default function RecommendationForm({ initial, onCancel, onSave, characterWeaponType, characterId }: RecommendationFormProps) {
  const [weapons, setWeapons] = useState<(string | Weapon)[]>(initial?.weapons || []);
  const [artifacts, setArtifacts] = useState<ArtifactOrCombination[]>(initial?.artifacts || []);
  const [weaponsList, setWeaponsList] = useState<Weapon[]>([]);
  const [artifactsList, setArtifactsList] = useState<Artifact[]>([]);
  const [showWeaponModal, setShowWeaponModal] = useState(false);
  const [showArtifactModal, setShowArtifactModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'weapons' | 'artifacts' | 'stats' | 'teams'>('weapons');

  // Загружаем список оружия и артефактов
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем оружие
        const weaponsResponse = await fetch('/api/weapons');
        if (weaponsResponse.ok) {
          const weaponsData = await weaponsResponse.json();
          const weaponsArray = Array.isArray(weaponsData.data) ? weaponsData.data : weaponsData.data?.weapons || weaponsData.weapons || weaponsData || [];
          setWeaponsList(weaponsArray);
        }

        // Загружаем артефакты
        const artifactsResponse = await fetch('/api/artifacts');
        if (artifactsResponse.ok) {
          const artifactsData = await artifactsResponse.json();
          setArtifactsList(Array.isArray(artifactsData.data) ? artifactsData.data : artifactsData.data?.artifacts || artifactsData.artifacts || artifactsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Обновляем состояние при изменении initial
  useEffect(() => {
    if (initial) {
      setWeapons(initial.weapons || []);
      setArtifacts(initial.artifacts || []);
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      weapons,
      artifacts,
    });
  };

  const tabs = [
    { id: 'weapons', label: 'Оружие', icon: '⚔️' },
    { id: 'artifacts', label: 'Артефакты', icon: '🛡️' },
    { id: 'stats', label: 'Статы', icon: '📊' },
    { id: 'teams', label: 'Команды', icon: '👥' }
  ];

  const handleWeaponSelect = (selectedWeaponIds: string[]) => {
    // Преобразуем ID в объекты оружий
    const selectedWeaponObjects = selectedWeaponIds.map(id => {
      const weapon = weaponsList.find(w => w.id === id);
      return weapon || id; // Если оружие не найдено, возвращаем ID как fallback
    });
    setWeapons(selectedWeaponObjects);
  };

  const handleArtifactSelect = (selectedArtifacts: ArtifactOrCombination[]) => {
    // Добавляем новые артефакты к существующим, а не заменяем их
    setArtifacts(prev => [...prev, ...selectedArtifacts]);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white">Рекомендации персонажа</h3>
          <p className="text-sm text-gray-400">Настройте оружие, артефакты, статы и команды для персонажа</p>
        </div>

        {/* Вкладки */}
        <div className="flex space-x-1 bg-neutral-700/50 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'weapons' | 'artifacts' | 'stats' | 'teams')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-600'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Вкладка оружия */}
        {activeTab === 'weapons' && (
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Рекомендуемое оружие</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {weapons.map((weaponItem, index) => {
                // Обрабатываем случай, когда оружие может быть объектом или строкой
                const weaponId = typeof weaponItem === 'string' ? weaponItem : weaponItem.id;
                const weapon = typeof weaponItem === 'string' 
                  ? weaponsList.find(w => w.id === weaponItem)
                  : weaponItem;
                
                if (!weapon) {
                  return null;
                }
                
                return (
                  <div key={`weapon-${weaponId}-${index}`} className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded px-3 py-2">
                    <OptimizedImage
                      src={getImageWithFallback(weapon.image, weapon.name, 'weapon')}
                      alt={weapon.name}
                      className="w-8 h-8 rounded"
                      type="weapon"
                    />
                    <span className="text-sm font-medium text-white">{weapon.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setWeapons(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >×</button>
                  </div>
                );
              })}
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowWeaponModal(true);
              }}
            >
              Выбрать оружие
            </Button>
          </div>
        )}

        {/* Вкладка артефактов */}
        {activeTab === 'artifacts' && (
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Рекомендуемые артефакты</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {artifacts.map((artifact, index) => {
                if ('id' in artifact) {
                  // Одиночный артефакт
                  return (
                    <div key={artifact.id} className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded px-3 py-2">
                      <OptimizedImage
                        src={getImageWithFallback(artifact.image, artifact.name, 'artifact')}
                        alt={artifact.name}
                        className="w-8 h-8 rounded"
                        type="artifact"
                      />
                      <span className="text-sm font-medium text-white">{artifact.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setArtifacts(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="text-red-400 hover:text-red-300 ml-1"
                      >×</button>
                    </div>
                  );
                } else {
                  // Комбинация артефактов
                  return (
                    <div key={index} className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded px-3 py-2">
                      <span className="text-sm font-medium text-white">{artifact.description}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setArtifacts(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="text-red-400 hover:text-red-300 ml-1"
                      >×</button>
                    </div>
                  );
                }
              })}
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowArtifactModal(true);
              }}
            >
              Выбрать артефакты
            </Button>
          </div>
        )}

        {/* Вкладка статов */}
        {activeTab === 'stats' && characterId && (
          <div className="space-y-4">
            <CharacterStatsManager 
              characterId={characterId} 
              onSave={() => {
                console.log('Stats saved successfully');
              }}
            />
          </div>
        )}

        {/* Вкладка команд */}
        {activeTab === 'teams' && characterId && (
          <div className="space-y-4">
            <CharacterTeamsManager 
              characterId={characterId} 
              onSave={() => {
                console.log('Teams saved successfully');
              }}
            />
          </div>
        )}
        
        <div className="flex gap-2 justify-end mt-2">
          <div className="flex items-center gap-2 mr-auto">
            {activeTab === 'stats' && (
              <span className="text-xs text-yellow-400">⚠️ Сначала сохраните статы кнопкой &quot;Сохранить статы&quot;</span>
            )}
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }}
          >
            Отмена
          </Button>
          <Button 
            type="submit" 
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Сохранить рекомендации
          </Button>
        </div>
      </form>

      {/* Модальное окно выбора оружия */}
      <WeaponSelectModal
        isOpen={showWeaponModal}
        onClose={() => setShowWeaponModal(false)}
        onSelect={handleWeaponSelect}
        selectedWeapons={weapons.map(w => typeof w === 'string' ? w : w.id)}
        weapons={weaponsList}
        weaponType={characterWeaponType}
      />

      {/* Модальное окно выбора артефактов */}
      <ArtifactSelectModal
        isOpen={showArtifactModal}
        onClose={() => setShowArtifactModal(false)}
        onSelect={handleArtifactSelect}
        selectedArtifacts={artifacts}
        artifacts={artifactsList}
      />
    </>
  );
} 