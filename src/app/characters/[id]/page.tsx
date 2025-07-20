'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Character } from '@/types';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import LoadingSpinner from '@/components/ui/loading-spinner';

type TabType = 'weapons' | 'teams' | 'builds' | 'talents' | 'constellations';

export default function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('weapons');

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
          
          <div className="absolute bottom-0 left-0 w-full bg-black/60 py-2 px-4 text-lg font-bold text-white text-center">
            {character.name}
          </div>
        </div>

        {/* Информация о персонаже */}
        <div className="flex flex-col px-4 py-6 w-full relative">
          {/* Декоративная полоска только на инфоблоке */}
          <div
            className="absolute left-0 top-0 h-full w-1.5 md:w-2 rounded-r-lg"
            style={{ background: elementColor }}
          />
          
          <div className="mb-4 text-sm text-gray-300">{character.description}</div>
          
          <ul className="text-sm text-gray-400 space-y-1">
            <li><span className="font-semibold text-text">Элемент:</span> {character.element}</li>
            <li><span className="font-semibold text-text">Оружие:</span> {character.weapon}</li>
            <li><span className="font-semibold text-text">Регион:</span> {character.region}</li>
            <li><span className="font-semibold text-text">Редкость:</span> {character.rarity}★</li>
            <li><span className="font-semibold text-text">Пол:</span> {character.gender}</li>
            <li><span className="font-semibold text-text">День рождения:</span> {character.birthday}</li>
            <li><span className="font-semibold text-text">Патч:</span> {character.patchNumber}</li>
          </ul>
        </div>
      </div>

      {/* Правая колонка: контент */}
      <div className="flex-1 flex flex-col min-h-full">
        <div className="flex gap-4 mb-6 mt-2 md:mt-4 flex-wrap px-4">
          <button
            className={`px-4 py-2 rounded font-semibold transition ${
              activeTab === 'weapons'
                ? 'bg-accent text-white'
                : 'bg-card text-gray-400 hover:bg-accent/20'
            }`}
            onClick={() => setActiveTab('weapons')}
          >
            Оружия и Артефакты
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition ${
              activeTab === 'teams'
                ? 'bg-accent text-white'
                : 'bg-card text-gray-400 hover:bg-accent/20'
            }`}
            onClick={() => setActiveTab('teams')}
          >
            Команды
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition ${
              activeTab === 'builds'
                ? 'bg-accent text-white'
                : 'bg-card text-gray-400 hover:bg-accent/20'
            }`}
            onClick={() => setActiveTab('builds')}
          >
            Сборки
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition ${
              activeTab === 'talents'
                ? 'bg-accent text-white'
                : 'bg-card text-gray-400 hover:bg-accent/20'
            }`}
            onClick={() => setActiveTab('talents')}
          >
            Таланты
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition ${
              activeTab === 'constellations'
                ? 'bg-accent text-white'
                : 'bg-card text-gray-400 hover:bg-accent/20'
            }`}
            onClick={() => setActiveTab('constellations')}
          >
            Созвездия
          </button>
        </div>

        <div className="flex-1 px-4">
          {activeTab === 'weapons' && (
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
                      Рекомендации по оружию пока не настроены
                    </div>
                  </div>

                  {/* Артефакты */}
                  <div>
                    <h2 className="block text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-text">
                      Рекомендуемые артефакты
                    </h2>
                    <div className="text-center text-gray-400 py-8">
                      Рекомендации по артефактам пока не настроены
                    </div>
                  </div>
                </div>

                {/* Правая колонка: Статы */}
                <div>
                  <div className="bg-card border border-neutral-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-white">Рекомендуемые статы</h3>
                    <p className="text-gray-400 text-sm">Статы для этого персонажа пока не настроены</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="text-center text-gray-400 py-8">
              Информация о командах пока не настроена
            </div>
          )}

          {activeTab === 'builds' && (
            <div>
              {character.gameplayDescription && (
                <div className="bg-card border border-neutral-700 rounded-lg p-4 mb-6 text-base text-neutral-200 whitespace-pre-line">
                  <h3 className="text-lg font-semibold mb-2 text-white">Общее описание геймплея</h3>
                  <p>{character.gameplayDescription}</p>
                </div>
              )}
              <div className="text-center text-gray-400 py-8">
                Сборки для этого персонажа пока не настроены
              </div>
            </div>
          )}

          {activeTab === 'talents' && (
            <div className="text-center text-gray-400 py-8">
              Информация о талантах пока не настроена
            </div>
          )}

          {activeTab === 'constellations' && (
            <div className="text-center text-gray-400 py-8">
              Информация о созвездиях пока не настроена
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 