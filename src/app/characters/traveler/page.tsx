'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import LoadingSpinner from '@/components/ui/loading-spinner';
import CharacterWeaponsSection from '@/components/character/CharacterWeaponsSection';
import CharacterTeamsSection from '@/components/character/CharacterTeamsSection';
import CharacterTalentsSection from '@/components/character/CharacterTalentsSection';
import CharacterConstellationsSection from '@/components/character/CharacterConstellationsSection';
import BuildsSection from '@/components/builds/BuildsSection';
import { Zap, Users, Sword, Star, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import HtmlContent from '@/components/ui/html-content';
import { WeaponModal } from '@/components/weapon-modal';
import { ArtifactModal } from '@/components/artifact-modal';
import { TalentModal } from '@/components/talent-modal';
import { ArtifactCombinationModal } from '@/components/artifact-combination-modal';
import StructuredData from '@/components/seo/StructuredData';
import { Character, Weapon, Artifact, Talent, ArtifactOrCombination } from '@/types';
import ElementSwitcher from '@/components/traveler/ElementSwitcher';

type TabType = 'weapons' | 'teams' | 'builds' | 'talents' | 'constellations';

// Данные талантов для каждого элемента
const travelerTalents = {
  anemo: [
    {
      name: 'Обычная атака: Иностранный меч',
      description: 'Выполняет до 5 быстрых атак.',
      type: 'Normal Attack' as const
    },
    {
      name: 'Элементальный навык: Вихрь',
      description: 'Создает вихрь, который втягивает врагов и наносит Анемо урон.',
      type: 'Elemental Skill' as const
    },
    {
      name: 'Элементальный взрыв: Ураган',
      description: 'Создает мощный ураган, который наносит Анемо урон по области.',
      type: 'Elemental Burst' as const
    }
  ],
  geo: [
    {
      name: 'Обычная атака: Иностранный меч',
      description: 'Выполняет до 5 быстрых атак.',
      type: 'Normal Attack' as const
    },
    {
      name: 'Элементальный навык: Звездная ракета',
      description: 'Создает гео-конструкцию, которая наносит Гео урон.',
      type: 'Elemental Skill' as const
    },
    {
      name: 'Элементальный взрыв: Скала',
      description: 'Создает мощную гео-конструкцию, которая наносит Гео урон по области.',
      type: 'Elemental Burst' as const
    }
  ],
  electro: [
    {
      name: 'Обычная атака: Иностранный меч',
      description: 'Выполняет до 5 быстрых атак.',
      type: 'Normal Attack' as const
    },
    {
      name: 'Элементальный навык: Молния',
      description: 'Наносит Электро урон и создает электро-реакции.',
      type: 'Elemental Skill' as const
    },
    {
      name: 'Элементальный взрыв: Гром',
      description: 'Создает мощную молнию, которая наносит Электро урон по области.',
      type: 'Elemental Burst' as const
    }
  ],
  dendro: [
    {
      name: 'Обычная атака: Иностранный меч',
      description: 'Выполняет до 5 быстрых атак.',
      type: 'Normal Attack' as const
    },
    {
      name: 'Элементальный навык: Рост',
      description: 'Создает дендро-конструкцию, которая наносит Дендро урон.',
      type: 'Elemental Skill' as const
    },
    {
      name: 'Элементальный взрыв: Лес',
      description: 'Создает мощную дендро-конструкцию, которая наносит Дендро урон по области.',
      type: 'Elemental Burst' as const
    }
  ]
};

// Данные созвездий для каждого элемента
const travelerConstellations = {
  anemo: [
    {
      name: 'С1: Вихревой поток',
      description: 'Увеличивает радиус действия элементального навыка.',
      level: 1
    },
    {
      name: 'С2: Воздушный поток',
      description: 'Увеличивает урон элементального взрыва.',
      level: 2
    },
    {
      name: 'С3: Ветреный клинок',
      description: 'Увеличивает уровень элементального навыка на 3.',
      level: 3
    },
    {
      name: 'С4: Ураганный клинок',
      description: 'Увеличивает уровень элементального взрыва на 3.',
      level: 4
    },
    {
      name: 'С5: Вихревой клинок',
      description: 'Увеличивает уровень обычной атаки на 3.',
      level: 5
    },
    {
      name: 'С6: Ветреный клинок',
      description: 'Увеличивает урон всех атак на 20%.',
      level: 6
    }
  ],
  geo: [
    {
      name: 'С1: Каменный поток',
      description: 'Увеличивает радиус действия элементального навыка.',
      level: 1
    },
    {
      name: 'С2: Земной поток',
      description: 'Увеличивает урон элементального взрыва.',
      level: 2
    },
    {
      name: 'С3: Каменный клинок',
      description: 'Увеличивает уровень элементального навыка на 3.',
      level: 3
    },
    {
      name: 'С4: Скальный клинок',
      description: 'Увеличивает уровень элементального взрыва на 3.',
      level: 4
    },
    {
      name: 'С5: Каменный клинок',
      description: 'Увеличивает уровень обычной атаки на 3.',
      level: 5
    },
    {
      name: 'С6: Земной клинок',
      description: 'Увеличивает урон всех атак на 20%.',
      level: 6
    }
  ],
  electro: [
    {
      name: 'С1: Молниеносный поток',
      description: 'Увеличивает радиус действия элементального навыка.',
      level: 1
    },
    {
      name: 'С2: Электрический поток',
      description: 'Увеличивает урон элементального взрыва.',
      level: 2
    },
    {
      name: 'С3: Молниеносный клинок',
      description: 'Увеличивает уровень элементального навыка на 3.',
      level: 3
    },
    {
      name: 'С4: Громовой клинок',
      description: 'Увеличивает уровень элементального взрыва на 3.',
      level: 4
    },
    {
      name: 'С5: Молниеносный клинок',
      description: 'Увеличивает уровень обычной атаки на 3.',
      level: 5
    },
    {
      name: 'С6: Электрический клинок',
      description: 'Увеличивает урон всех атак на 20%.',
      level: 6
    }
  ],
  dendro: [
    {
      name: 'С1: Растительный поток',
      description: 'Увеличивает радиус действия элементального навыка.',
      level: 1
    },
    {
      name: 'С2: Лесной поток',
      description: 'Увеличивает урон элементального взрыва.',
      level: 2
    },
    {
      name: 'С3: Растительный клинок',
      description: 'Увеличивает уровень элементального навыка на 3.',
      level: 3
    },
    {
      name: 'С4: Лесной клинок',
      description: 'Увеличивает уровень элементального взрыва на 3.',
      level: 4
    },
    {
      name: 'С5: Растительный клинок',
      description: 'Увеличивает уровень обычной атаки на 3.',
      level: 5
    },
    {
      name: 'С6: Лесной клинок',
      description: 'Увеличивает урон всех атак на 20%.',
      level: 6
    }
  ]
};

export default function TravelerPage() {
  return <TravelerPageContent />;
}

function TravelerPageContent() {
  const [currentElement, setCurrentElement] = useState('anemo');
  const [activeTab, setActiveTab] = useState<TabType>('weapons');
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [selectedCombination, setSelectedCombination] = useState<ArtifactOrCombination | null>(null);
  const [isWeaponModalOpen, setIsWeaponModalOpen] = useState(false);
  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [isCombinationModalOpen, setIsCombinationModalOpen] = useState(false);
  const [isGameplayDescriptionCollapsed, setIsGameplayDescriptionCollapsed] = useState(false);

  const elementColors: { [key: string]: string } = {
    anemo: '#22c55e',
    geo: '#eab308',
    electro: '#a21caf',
    dendro: '#10b981'
  };

  const elementNames: { [key: string]: string } = {
    anemo: 'Анемо',
    geo: 'Гео',
    electro: 'Электро',
    dendro: 'Дендро'
  };

  const getElementColor = (element: string) => {
    return elementColors[element] || '#6b7280';
  };

  const handleElementChange = (element: string) => {
    setCurrentElement(element);
  };

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
  };

  const handleItemClick = async (type: string, id: string) => {
    try {
      if (type === 'weapon') {
        const response = await fetch(`/api/weapons/${id}`);
        if (response.ok) {
          const weapon = await response.json();
          setSelectedWeapon(weapon);
          setIsWeaponModalOpen(true);
        } else {
          console.error('Failed to fetch weapon:', response.status, response.statusText);
        }
      } else if (type === 'artifact') {
        const response = await fetch(`/api/artifacts/${id}`);
        if (response.ok) {
          const artifact = await response.json();
          setSelectedArtifact(artifact);
          setIsArtifactModalOpen(true);
        } else {
          console.error('Failed to fetch artifact:', response.status, response.statusText);
        }
      } else if (type === 'talent') {
        const response = await fetch(`/api/talents/${id}`);
        if (response.ok) {
          const talent = await response.json();
          setSelectedTalent(talent);
          setIsTalentModalOpen(true);
        } else {
          console.error('Failed to fetch talent:', response.status, response.statusText);
        }
      } else if (type === 'character') {
        window.location.href = `/characters/${id}`;
      }
    } catch (error) {
      console.error('Error fetching item data:', error);
    }
  };

  const currentElementColor = getElementColor(currentElement);
  const currentElementName = elementNames[currentElement] || currentElement;

  // Создаем объект персонажа для совместимости с существующими компонентами
  const character: Character = {
    id: 'traveler',
    name: 'Путешественник',
    image: '/images/characters/traveler.jpg',
    element: currentElementName,
    weapon: 'Одноручный меч',
    region: 'Все регионы',
    rarity: 5,
    gender: 'Выбор игрока',
    description: 'Главный персонаж, который может использовать все элементы. Переключайтесь между элементами, чтобы увидеть различные таланты, созвездия и рекомендации.',
    birthday: 'Неизвестно',
    patchNumber: '1.0',
    gameplayDescription: 'Путешественник - это главный персонаж игры, который может овладеть всеми семью элементами. В зависимости от выбранного элемента, персонаж получает уникальные таланты и способности.',
    views: 0,
    isActive: true,
    isFeatured: true,
    role: 'DPS/Support',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <StructuredData character={character} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Заголовок и основная информация */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Левая колонка - изображение и основная информация */}
            <div className="flex-shrink-0 w-full lg:w-80">
              <div className="relative">
                <div className="aspect-[5/7] relative overflow-hidden rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-8xl">🌟</div>
                  </div>
                  {/* Элементы вокруг */}
                  <div className="absolute top-4 left-4 text-2xl">💨</div>
                  <div className="absolute top-4 right-4 text-2xl">🪨</div>
                  <div className="absolute bottom-4 left-4 text-2xl">⚡</div>
                  <div className="absolute bottom-4 right-4 text-2xl">🌱</div>
                </div>
                
                {/* Специальный бейдж для главного персонажа */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  ГГ
                </div>
              </div>

              {/* Основная информация */}
              <div className="mt-6 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Путешественник</h1>
                  <div className="flex items-center gap-3">
                    <div 
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ 
                        backgroundColor: `${currentElementColor}20`,
                        color: currentElementColor,
                        border: `1px solid ${currentElementColor}`
                      }}
                    >
                      {currentElementName}
                    </div>
                    <div className="px-3 py-1 bg-neutral-700 rounded-full text-sm">
                      Одноручный меч
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[5, 5, 5, 5, 5].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>

                <div className="text-gray-300">
                  <p><strong>Регион:</strong> Все регионы</p>
                  <p><strong>Пол:</strong> Выбор игрока</p>
                  <p><strong>Роль:</strong> DPS/Support</p>
                </div>
              </div>
            </div>

            {/* Правая колонка - описание и переключатель элементов */}
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Описание</h2>
                <div className="text-gray-300 leading-relaxed">
                  <p className="mb-4">
                    Главный персонаж игры, который может овладеть всеми семью элементами. 
                    В зависимости от выбранного элемента, персонаж получает уникальные таланты и способности.
                  </p>
                  <p>
                    Переключайтесь между элементами, чтобы увидеть различные таланты, созвездия и рекомендации.
                  </p>
                </div>
              </div>

              {/* Переключатель элементов */}
              <ElementSwitcher 
                currentElement={currentElement}
                onElementChange={handleElementChange}
              />
            </div>
          </div>
        </div>

        {/* Вкладки */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-neutral-700">
            {[
              { id: 'weapons', label: 'Оружие', icon: Sword },
              { id: 'teams', label: 'Команды', icon: Users },
              { id: 'builds', label: 'Геймплей и детали сборок', icon: BookOpen },
              { id: 'talents', label: 'Таланты', icon: Zap },
              { id: 'constellations', label: 'Созвездия', icon: Star }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as TabType)}
                  className={`
                    flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2
                    ${activeTab === tab.id
                      ? 'text-white border-blue-500'
                      : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
                    }
                  `}
                  style={{
                    borderBottomColor: activeTab === tab.id ? currentElementColor : undefined,
                    color: activeTab === tab.id ? currentElementColor : undefined
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Контент вкладок */}
        <div className="space-y-6">
          {activeTab === 'weapons' && (
            <CharacterWeaponsSection 
              character={character}
              onItemClick={handleItemClick}
            />
          )}

          {activeTab === 'teams' && (
            <CharacterTeamsSection 
              character={character}
              onItemClick={handleItemClick}
            />
          )}

          {activeTab === 'builds' && (
            <BuildsSection 
              characterId={character.id}
              onItemClick={handleItemClick}
            />
          )}

          {activeTab === 'talents' && (
            <CharacterTalentsSection 
              character={character}
              onItemClick={handleItemClick}
            />
          )}

          {activeTab === 'constellations' && (
            <CharacterConstellationsSection 
              character={character}
              onItemClick={handleItemClick}
            />
          )}
        </div>
      </div>

      {/* Модальные окна */}
      {selectedWeapon && (
        <WeaponModal
          weapon={selectedWeapon}
          isOpen={isWeaponModalOpen}
          onClose={() => setIsWeaponModalOpen(false)}
        />
      )}

      {selectedArtifact && (
        <ArtifactModal
          artifact={selectedArtifact}
          isOpen={isArtifactModalOpen}
          onClose={() => setIsArtifactModalOpen(false)}
        />
      )}

      {selectedTalent && (
        <TalentModal
          talent={selectedTalent}
          isOpen={isTalentModalOpen}
          onClose={() => setIsTalentModalOpen(false)}
        />
      )}

      {selectedCombination && (
        <ArtifactCombinationModal
          combination={selectedCombination}
          isOpen={isCombinationModalOpen}
          onClose={() => setIsCombinationModalOpen(false)}
        />
      )}
    </div>
  );
}
