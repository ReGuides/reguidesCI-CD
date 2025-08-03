'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Character } from '@/types';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import LoadingSpinner from '@/components/ui/loading-spinner';
import CharacterWeaponsSection from '@/components/character/CharacterWeaponsSection';
import CharacterTeamsSection from '@/components/character/CharacterTeamsSection';
import CharacterTalentsSection from '@/components/character/CharacterTalentsSection';
import CharacterConstellationsSection from '@/components/character/CharacterConstellationsSection';
import BuildsSection from '@/components/builds/BuildsSection';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { Zap, Users, Sword, Star, BookOpen } from 'lucide-react';
import { WeaponModal } from '@/components/weapon-modal';
import { ArtifactModal } from '@/components/artifact-modal';
import { TalentModal } from '@/components/talent-modal';
import { Weapon, Artifact, Talent } from '@/types';

type TabType = 'weapons' | 'teams' | 'builds' | 'talents' | 'constellations';

export default function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('weapons');
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [isWeaponModalOpen, setIsWeaponModalOpen] = useState(false);
  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/characters/${id}`);
        if (!response.ok) {
          throw new Error('Character not found');
        }
        
        const data = await response.json();
        setCharacter(data);
        
        // Увеличиваем счетчик просмотров
        try {
          await fetch(`/api/characters/${id}/views`, { method: 'POST' });
        } catch (error) {
          console.error('Error incrementing views:', error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  const getElementColor = (element: string) => {
    const colors: { [key: string]: string } = {
      'пиро': '#ef4444',
      'гидро': '#3b82f6',
      'электро': '#a21caf',
      'крио': '#06b6d4',
      'анемо': '#22c55e',
      'гео': '#eab308',
      'дендро': '#10b981'
    };
    return colors[element.toLowerCase()] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" className="text-accent" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-red-400">
          <h2 className="text-2xl font-bold mb-4">Ошибка загрузки</h2>
          <p>{error || 'Персонаж не найден'}</p>
        </div>
      </div>
    );
  }

  const elementColor = getElementColor(character.element || '');

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
        // Для персонажей перенаправляем на страницу персонажа
        window.location.href = `/characters/${id}`;
      }
    } catch (error) {
      console.error('Error fetching item data:', error);
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full h-full">
      {/* Левая колонка: информация о персонаже */}
      <div 
        className="relative md:w-80 min-h-full flex flex-col w-full overflow-y-auto" 
        style={{ background: elementColor + '33' }}
      >
        {/* Декоративная полоска */}
        <div
          className="hidden md:block absolute left-0 top-0 h-full rounded-r-xl"
          style={{ width: 6, background: elementColor }}
        />
        
        {/* Изображение персонажа */}
        <div className="relative w-full aspect-[5/7] bg-neutral-900 rounded overflow-hidden" style={{ aspectRatio: '5 / 7' }}>
          {/* Кнопка назад */}
          <Link
            href="/characters"
            className="absolute top-3 left-3 z-20 bg-black/60 hover:bg-black/80 text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow"
          >
            <span className="text-xl">←</span> Назад
          </Link>
          
          <img 
            src={getImageWithFallback(character.image, character.name, 'character')} 
            alt={character.name} 
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/characters/default.png';
            }}
          />
          
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent py-4 px-4">
            <div className="text-center">
              <h1 className="text-xl font-bold text-white mb-1">{character.name}</h1>
              {character.views && character.views > 0 && (
                <p className="text-xs text-gray-300">
                  {character.views.toLocaleString()} просмотров
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Информация о персонаже */}
        <div className="flex flex-col px-4 py-6 w-full relative">
          {/* Декоративная полоска только на инфоблоке */}
          <div
            className="absolute left-0 top-0 h-full w-1.5 md:w-2 rounded-r-lg"
            style={{ background: elementColor }}
          />
          
          {/* Описание */}
          {character.description && (
            <div className="mb-6">
              <p className="text-sm text-gray-300 leading-relaxed">{character.description}</p>
            </div>
          )}
          
          {/* Основная информация */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ background: elementColor }}
                  />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Элемент</span>
                </div>
                <p className="text-white font-medium">{character.element}</p>
              </div>
              
              <div className="bg-neutral-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Оружие</span>
                </div>
                <p className="text-white font-medium">{
                  typeof character.weapon === 'string'
                    ? character.weapon
                    : (character.weapon?.name?.toString() || 'Не указано')
                }</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Регион</span>
                </div>
                <p className="text-white font-medium">{character.region}</p>
              </div>
              
              <div className="bg-neutral-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Редкость</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Number(character.rarity) || 0 }, (_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Пол</span>
                </div>
                <p className="text-white font-medium">{character.gender}</p>
              </div>
              
              <div className="bg-neutral-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Патч</span>
                </div>
                <p className="text-white font-medium">{character.patchNumber}</p>
              </div>
            </div>
            
            {character.birthday && (
              <div className="bg-neutral-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">День рождения</span>
                </div>
                <p className="text-white font-medium">{character.birthday}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Правая колонка: контент */}
      <div className="flex-1 flex flex-col min-h-full">
        <div className="flex gap-2 mb-6 mt-2 md:mt-4 flex-wrap px-4">
          <button
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'weapons'
                ? 'bg-accent text-white shadow-lg shadow-accent/25'
                : 'bg-card text-gray-400 hover:bg-accent/10 hover:text-white'
            }`}
            onClick={() => setActiveTab('weapons')}
          >
            <Zap className="w-4 h-4" />
            Оружия и Артефакты
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'teams'
                ? 'bg-accent text-white shadow-lg shadow-accent/25'
                : 'bg-card text-gray-400 hover:bg-accent/10 hover:text-white'
            }`}
            onClick={() => setActiveTab('teams')}
          >
            <Users className="w-4 h-4" />
            Команды
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'builds'
                ? 'bg-accent text-white shadow-lg shadow-accent/25'
                : 'bg-card text-gray-400 hover:bg-accent/10 hover:text-white'
            }`}
            onClick={() => setActiveTab('builds')}
          >
            <BookOpen className="w-4 h-4" />
            Сборки
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'talents'
                ? 'bg-accent text-white shadow-lg shadow-accent/25'
                : 'bg-card text-gray-400 hover:bg-accent/10 hover:text-white'
            }`}
            onClick={() => setActiveTab('talents')}
          >
            <Sword className="w-4 h-4" />
            Таланты
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'constellations'
                ? 'bg-accent text-white shadow-lg shadow-accent/25'
                : 'bg-card text-gray-400 hover:bg-accent/10 hover:text-white'
            }`}
            onClick={() => setActiveTab('constellations')}
          >
            <Star className="w-4 h-4" />
            Созвездия
          </button>
        </div>

        <div className="flex-1 px-4 animate-in fade-in duration-300">
          {activeTab === 'weapons' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Оружия и Артефакты</h2>
                <p className="text-gray-400">Рекомендуемое оружие, артефакты и статы для {character.name}</p>
              </div>
              <CharacterWeaponsSection characterId={character.id} />
            </div>
          )}

          {activeTab === 'teams' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Команды</h2>
                <p className="text-gray-400">Рекомендуемые команды и совместимые персонажи для {character.name}</p>
              </div>
              <CharacterTeamsSection characterId={character.id} />
            </div>
          )}

          {activeTab === 'builds' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Сборки</h2>
                <p className="text-gray-400">Готовые сборки и стратегии для {character.name}</p>
              </div>
              {character.gameplayDescription && (
                <div className="bg-card border border-neutral-700 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    Общее описание геймплея
                  </h3>
                  <MarkdownRenderer content={character.gameplayDescription} onItemClick={handleItemClick} />
                </div>
              )}
              <BuildsSection characterId={character.id} />
            </div>
          )}

          {activeTab === 'talents' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Таланты</h2>
                <p className="text-gray-400">Таланты и приоритеты прокачки для {character.name}</p>
              </div>
              <CharacterTalentsSection characterId={character.id} />
            </div>
          )}

          {activeTab === 'constellations' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Созвездия</h2>
                <p className="text-gray-400">Созвездия и приоритеты для {character.name}</p>
              </div>
              <CharacterConstellationsSection characterId={character.id} />
            </div>
          )}
        </div>
      </div>
      
      {/* Модалки */}
      <WeaponModal
        weapon={selectedWeapon}
        isOpen={isWeaponModalOpen}
        onClose={closeWeaponModal}
      />
      <ArtifactModal
        artifact={selectedArtifact}
        isOpen={isArtifactModalOpen}
        onClose={closeArtifactModal}
      />
      <TalentModal
        talent={selectedTalent}
        isOpen={isTalentModalOpen}
        onClose={closeTalentModal}
      />
    </div>
  );
} 