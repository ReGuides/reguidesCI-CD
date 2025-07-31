'use client';

import React, { useState, useEffect } from 'react';
import { Character } from '@/types';
import OptimizedImage from '@/components/ui/optimized-image';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import { Shield, Zap, Heart, Users } from 'lucide-react';

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
  main_dps: Shield,
  sub_dps: Zap,
  support: Users,
  healer: Heart
};

const POSITION_LABELS = {
  main_dps: 'Основной ДПС',
  sub_dps: 'Вторичный ДПС',
  support: 'Поддержка',
  healer: 'Лекарь'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-neutral-700 rounded"></div>
            ))}
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

  return (
    <div className="space-y-8">
      {/* Рекомендуемые команды */}
      {teamsData.recommendedTeams.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Рекомендуемые команды</h3>
          <div className="space-y-6">
            {teamsData.recommendedTeams.map((team, teamIndex) => (
              <div key={teamIndex} className="bg-card border border-neutral-700 rounded-lg p-6">
                <h4 className="text-md font-semibold mb-4 text-white">
                  Команда {teamsData.recommendedTeams.length > 1 ? teamIndex + 1 : ''}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(team.positions).map(([position, positionData]) => {
                    const Icon = POSITION_ICONS[position as keyof typeof POSITION_ICONS];
                    const label = POSITION_LABELS[position as keyof typeof POSITION_LABELS];
                    
                    return (
                      <div key={position} className="bg-neutral-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-white">{label}</span>
                        </div>
                        
                        <div className="space-y-2">
                          {positionData.characters.length === 0 ? (
                            <p className="text-gray-400 text-xs">Нет персонажей</p>
                          ) : (
                            positionData.characters.map(characterId => {
                              const character = getCharacterById(characterId);
                              if (!character) return null;
                              
                              return (
                                <div key={characterId} className="flex items-center gap-2 bg-neutral-700 rounded px-2 py-1">
                                  <OptimizedImage
                                    src={getImageWithFallback(character.image, character.name, 'character')}
                                    alt={character.name}
                                    className="w-6 h-6 rounded"
                                    type="character"
                                  />
                                  <span className="text-xs text-white truncate">{character.name}</span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {team.notes && (
                  <div className="mt-4 p-3 bg-neutral-800 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-300 mb-1">Заметки к команде</h5>
                    <p className="text-sm text-gray-400">{team.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
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
                <div key={index} className="flex items-center gap-2 bg-neutral-800 rounded-lg p-2">
                  <OptimizedImage
                    src={getImageWithFallback(character.image, character.name, 'character')}
                    alt={character.name}
                    className="w-8 h-8 rounded"
                    type="character"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{character.name}</p>
                    <p className="text-xs text-gray-400">{character.element}</p>
                  </div>
                </div>
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