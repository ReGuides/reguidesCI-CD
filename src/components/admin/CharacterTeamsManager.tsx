'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users, Shield, Zap, Heart } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import { Character } from '@/types';

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

interface CompatibleCharacter {
  characterId: string;
}

interface CharacterTeamsManagerProps {
  characterId: string;
  onSave?: () => void;
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

const CharacterTeamsManager: React.FC<CharacterTeamsManagerProps> = ({ characterId, onSave }) => {
  const [recommendedTeams, setRecommendedTeams] = useState<RecommendedTeam[]>([]);
  const [compatibleCharacters, setCompatibleCharacters] = useState<CompatibleCharacter[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [charactersList, setCharactersList] = useState<Character[]>([]);
  const [showCharacterSelect, setShowCharacterSelect] = useState<{
    open: boolean;
    teamIndex: number;
    position: keyof RecommendedTeam['positions'] | null;
  }>({ open: false, teamIndex: -1, position: null });

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/characters/${characterId}/teams`);
      if (response.ok) {
        const data = await response.json();
        setRecommendedTeams(data.recommendedTeams || []);
        setCompatibleCharacters(data.compatibleCharacters || []);
        setNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  const fetchCharacters = useCallback(async () => {
    try {
      const response = await fetch('/api/characters');
      if (response.ok) {
        const data = await response.json();
        const charactersArray = Array.isArray(data.data) ? data.data : data.data?.characters || data.characters || data || [];
        setCharactersList(charactersArray);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
    fetchCharacters();
  }, [characterId, fetchTeams, fetchCharacters]);

  const handleSaveTeams = async () => {
    setSaving(true);
    try {
      const teamsData = {
        recommendedTeams,
        compatibleCharacters,
        notes
      };

      const response = await fetch(`/api/characters/${characterId}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamsData)
      });
      
      if (response.ok) {
        onSave?.();
      } else {
        console.error('Error saving teams');
      }
    } catch (error) {
      console.error('Error saving teams:', error);
    } finally {
      setSaving(false);
    }
  };

  const createEmptyTeam = (): RecommendedTeam => ({
    positions: {
      main_dps: { characters: [] },
      sub_dps: { characters: [] },
      support: { characters: [] },
      healer: { characters: [] }
    },
    notes: ''
  });

  const addTeam = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setRecommendedTeams([...recommendedTeams, createEmptyTeam()]);
  };

  const removeTeam = (index: number) => {
    setRecommendedTeams(recommendedTeams.filter((_, i) => i !== index));
  };

  const updateTeamPosition = (teamIndex: number, position: keyof RecommendedTeam['positions'], characterId: string, isAdding: boolean) => {
    const updatedTeams = [...recommendedTeams];
    const team = updatedTeams[teamIndex];
    const positionData = team.positions[position];
    
    if (!positionData) return;
    
    if (isAdding) {
      if (positionData.characters.length < 4) {
        positionData.characters.push(characterId);
      }
    } else {
      positionData.characters = positionData.characters.filter(id => id !== characterId);
    }
    
    setRecommendedTeams(updatedTeams);
  };

  const updateTeamNotes = (teamIndex: number, notes: string) => {
    const updatedTeams = [...recommendedTeams];
    updatedTeams[teamIndex].notes = notes;
    setRecommendedTeams(updatedTeams);
  };

  const addCompatibleCharacter = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCompatibleCharacters([...compatibleCharacters, { characterId: '' }]);
  };

  const removeCompatibleCharacter = (index: number) => {
    setCompatibleCharacters(compatibleCharacters.filter((_, i) => i !== index));
  };

  const updateCompatibleCharacter = (index: number, characterId: string) => {
    const updated = [...compatibleCharacters];
    updated[index].characterId = characterId;
    setCompatibleCharacters(updated);
  };

  const openCharacterSelect = (teamIndex: number, position: keyof RecommendedTeam['positions']) => {
    setShowCharacterSelect({ open: true, teamIndex, position });
  };

  const handleCharacterSelect = (selected: string[]) => {
    if (showCharacterSelect.position && showCharacterSelect.teamIndex >= 0) {
      const { teamIndex, position } = showCharacterSelect;
      const updatedTeams = [...recommendedTeams];
      updatedTeams[teamIndex].positions[position].characters = selected;
      setRecommendedTeams(updatedTeams);
    }
    setShowCharacterSelect({ open: false, teamIndex: -1, position: null });
  };

  const renderTeamForm = (team: RecommendedTeam, index: number) => (
    <div key={index} className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">Команда {index + 1}</h4>
                          <Button
                    type="button"
                    onClick={() => removeTeam(index)}
                    size="sm"
                    variant="outline"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(team.positions) as Array<keyof RecommendedTeam['positions']>).map(position => {
          const Icon = POSITION_ICONS[position];
          const label = POSITION_LABELS[position];
          const characters = team.positions[position].characters;
          
          return (
            <div key={position} className="bg-neutral-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">{label}</span>
                </div>
                <Button
                  type="button"
                  onClick={() => openCharacterSelect(index, position)}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Выбрать
                </Button>
              </div>
              
              <div className="space-y-1">
                {characters.length === 0 ? (
                  <p className="text-gray-400 text-xs">Нет персонажей</p>
                ) : (
                  characters.map(characterId => {
                    const characterData = charactersList.find(c => c.id === characterId);
                    if (!characterData) return null;
                    
                    return (
                      <div key={characterId} className="flex items-center gap-2 bg-neutral-600 rounded px-2 py-1">
                        <OptimizedImage
                          src={getImageWithFallback(characterData.image, characterData.name, 'character')}
                          alt={characterData.name}
                          className="w-6 h-6 rounded"
                          type="character"
                        />
                        <span className="text-xs text-white">{characterData.name}</span>
                        <Button
                          type="button"
                          onClick={() => updateTeamPosition(index, position, characterId, false)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 p-0 h-auto"
                        >
                          ×
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-400 mb-2">Заметки к команде</label>
        <textarea
          value={team.notes || ''}
          onChange={(e) => updateTeamNotes(index, e.target.value)}
          placeholder="Введите заметки к команде..."
          className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white min-h-[80px] resize-none"
        />
      </div>
    </div>
  );

  const renderCompatibleCharacterForm = (compatible: CompatibleCharacter, index: number) => (
    <div key={index} className="flex items-center gap-2">
              <select
          value={compatible.characterId}
          onChange={(e) => updateCompatibleCharacter(index, e.target.value)}
          className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
        >
          <option value="">Выберите персонажа</option>
          {charactersList.map(character => (
            <option key={character.id} value={character.id}>
              {character.name} ({character.element})
            </option>
          ))}
        </select>
                        <Button
                    type="button"
                    onClick={() => removeCompatibleCharacter(index)}
                    size="sm"
                    variant="outline"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
    </div>
  );

  if (loading) {
    return <div className="text-center py-4 text-gray-400">Загрузка команд...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Команды персонажа</h3>
        <Button 
          onClick={handleSaveTeams} 
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? 'Сохранение...' : 'Сохранить команды'}
        </Button>
      </div>

      {/* Рекомендуемые команды */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-white">Рекомендуемые команды</h4>
          <Button 
            type="button"
            onClick={addTeam} 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить команду
          </Button>
        </div>

        {recommendedTeams.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p>Нет рекомендуемых команд</p>
            <p className="text-sm">Нажмите "Добавить команду" чтобы создать первую команду</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendedTeams.map((team, index) => renderTeamForm(team, index))}
          </div>
        )}
      </div>

      {/* Совместимые персонажи */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-white">Совместимые персонажи</h4>
          <Button 
            type="button"
            onClick={addCompatibleCharacter} 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </div>

        {compatibleCharacters.length === 0 ? (
          <p className="text-gray-400 text-sm">Нет совместимых персонажей</p>
        ) : (
          <div className="space-y-2">
            {compatibleCharacters.map((compatible, index) => renderCompatibleCharacterForm(compatible, index))}
          </div>
        )}
      </div>

      {/* Общие заметки */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <h4 className="text-md font-semibold text-white mb-3">Общие заметки по командам</h4>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Введите общие заметки по командам..."
          className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white min-h-[100px] resize-none"
        />
      </div>

      {/* Модальное окно выбора персонажей */}
      {showCharacterSelect.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-white">Выберите персонажей</h2>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
              {charactersList.map(character => {
                const isSelected = showCharacterSelect.position && 
                  showCharacterSelect.teamIndex >= 0 &&
                  recommendedTeams[showCharacterSelect.teamIndex]?.positions[showCharacterSelect.position]?.characters.includes(character.id);
                
                return (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => {
                      if (showCharacterSelect.position && showCharacterSelect.teamIndex >= 0) {
                        updateTeamPosition(
                          showCharacterSelect.teamIndex,
                          showCharacterSelect.position!,
                          character.id,
                          !isSelected
                        );
                      }
                    }}
                    className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 border-blue-400 text-white' 
                        : 'bg-neutral-800 border-neutral-700 text-gray-200'
                    }`}
                  >
                    <OptimizedImage
                      src={getImageWithFallback(character.image, character.name, 'character')}
                      alt={character.name}
                      className="w-8 h-8 rounded object-cover"
                      type="character"
                    />
                    <span className="text-sm">{character.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4 mt-6">
                          <Button
              type="button"
              onClick={() => setShowCharacterSelect({ open: false, teamIndex: -1, position: null })}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Готово
            </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterTeamsManager; 