'use client';

import React, { useState, useEffect } from 'react';
import { Character } from '@/types';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import { Users, Star } from 'lucide-react';
import Link from 'next/link';

interface CharacterTeamsSectionProps {
  characterId: string;
}

interface TeamPosition {
  characters: string[];
}

interface RecommendedTeam {
  positions: {
    main_dps: TeamPosition;
    sub_dps: TeamPosition;
    support: TeamPosition;
    healer: TeamPosition;
  };
  notes?: string;
}

interface CharacterTeams {
  characterId: string;
  recommendedTeams: RecommendedTeam[];
  compatibleCharacters: { characterId: string }[];
  notes?: string;
}

const POSITION_ICONS = {
  main_dps: Users,
  sub_dps: Users,
  support: Users,
  healer: Users
};

const POSITION_LABELS = {
  main_dps: 'Позиция 1',
  sub_dps: 'Позиция 2',
  support: 'Позиция 3',
  healer: 'Позиция 4'
};

const POSITION_COLORS = {
  main_dps: 'text-blue-400',
  sub_dps: 'text-blue-400',
  support: 'text-blue-400',
  healer: 'text-blue-400'
};

const CharacterTeamsSection: React.FC<CharacterTeamsSectionProps> = ({ characterId }) => {
  const [teamsData, setTeamsData] = useState<CharacterTeams | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загружаем команды
        const teamsResponse = await fetch(`/api/characters/${characterId}/teams`);
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeamsData(teamsData);
        }
        
        // Загружаем всех персонажей для отображения
        const charactersResponse = await fetch('/api/characters');
        if (charactersResponse.ok) {
          const data = await charactersResponse.json();
          const charactersArray = Array.isArray(data.data) ? data.data : data.data?.characters || data.characters || data || [];
          setCharacters(charactersArray);
        }
      } catch (error) {
        console.error('Error fetching teams data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [characterId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-700 rounded mb-4"></div>
          <div className="overflow-x-auto">
            <div className="min-w-full bg-neutral-800 rounded-lg">
              <div className="h-64 bg-neutral-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!teamsData || (teamsData.recommendedTeams.length === 0 && teamsData.compatibleCharacters.length === 0)) {
    return (
      <div className="text-center text-gray-400 py-8">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-lg font-semibold mb-2">Информация о командах</h3>
        <p>Команды для этого персонажа пока не настроены</p>
      </div>
    );
  }

  const getCharacterById = (id: string) => {
    return characters.find(c => c.id === id);
  };

  const positions = ['main_dps', 'sub_dps', 'support', 'healer'] as const;

  return (
    <div className="space-y-8">
      {/* Рекомендуемые команды в табличном виде */}
      {teamsData.recommendedTeams.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Рекомендуемые команды</h3>
          
          <div className="overflow-x-auto">
            <div className="min-w-full bg-neutral-800 rounded-lg border border-neutral-700">
              {/* Заголовок таблицы */}
              <div className="grid grid-cols-5 gap-4 p-4 border-b border-neutral-700 bg-neutral-750">
                <div className="text-sm font-medium text-gray-400">Команда</div>
                {positions.map(position => {
                  const Icon = POSITION_ICONS[position];
                  const label = POSITION_LABELS[position];
                  const color = POSITION_COLORS[position];
                  
                  return (
                    <div key={position} className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-sm font-medium text-white">{label}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Строки команд */}
              <div className="divide-y divide-neutral-700">
                {teamsData.recommendedTeams.map((team, teamIndex) => (
                  <div key={teamIndex}>
                    {/* Основная строка команды */}
                    <div className="grid grid-cols-5 gap-4 p-4 hover:bg-neutral-750 transition-colors">
                      {/* Название команды */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium text-white">
                            Команда {teamsData.recommendedTeams.length > 1 ? teamIndex + 1 : ''}
                          </span>
                        </div>
                      </div>
                      
                      {/* Персонажи по ролям */}
                      {positions.map(position => {
                        const positionData = team.positions[position];
                        
                        return (
                          <div key={position} className="space-y-2">
                            {positionData.characters.length === 0 ? (
                              <div className="text-gray-500 text-xs italic">—</div>
                            ) : (
                              positionData.characters.map(characterId => {
                                const character = getCharacterById(characterId);
                                if (!character) return null;
                                
                                return (
                                  <Link 
                                    key={characterId} 
                                    href={`/characters/${character.id}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-700 transition-colors group"
                                  >
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-700">
                                      <img
                                        src={getImageWithFallback(character.image, character.name, 'character')}
                                        alt={character.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = '/images/characters/default.png';
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-white truncate group-hover:text-blue-400 transition-colors">
                                        {character.name}
                                      </p>
                                      <p className="text-xs text-gray-400">{character.element}</p>
                                    </div>
                                  </Link>
                                );
                              })
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Строка с заметками к команде */}
                    {team.notes && (
                      <div className="grid grid-cols-5 gap-4 p-4 bg-neutral-750/50">
                        <div></div>
                        <div className="col-span-4">
                          <p className="text-sm text-gray-400">{team.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Заметки к командам */}
          {/* This section is now integrated into the table */}
        </div>
      )}

      {/* Совместимые персонажи */}
      {teamsData.compatibleCharacters.length > 0 && (
        <div className="bg-card border border-neutral-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Совместимые персонажи</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {teamsData.compatibleCharacters.map((compatible, index) => {
              const character = getCharacterById(compatible.characterId);
              if (!character) return null;
              
              return (
                <Link 
                  key={index} 
                  href={`/characters/${character.id}`}
                  className="flex items-center gap-3 bg-neutral-800 rounded-lg p-3 hover:bg-neutral-700 transition-colors group"
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-700">
                    <img
                      src={getImageWithFallback(character.image, character.name, 'character')}
                      alt={character.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/characters/default.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate group-hover:text-blue-400 transition-colors">
                      {character.name}
                    </p>
                    <p className="text-xs text-gray-400">{character.element}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Общие заметки */}
      {teamsData.notes && (
        <div className="bg-card border border-neutral-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-white">Общие заметки по командам</h3>
          <p className="text-gray-400 whitespace-pre-line">{teamsData.notes}</p>
        </div>
      )}
    </div>
  );
};

export default CharacterTeamsSection; 