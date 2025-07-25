'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OptimizedImage from '@/components/ui/optimized-image';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import { Character } from '@/types';
import { X, Search } from 'lucide-react';

interface CharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (characterIds: string[]) => void;
  selectedCharacters: string[];
  title?: string;
  multiple?: boolean;
}

const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedCharacters,
  title = 'Выбор персонажей',
  multiple = true
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedCharacters);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCharacters();
      setSelectedIds(selectedCharacters);
    }
  }, [isOpen, selectedCharacters]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCharacters(characters);
    } else {
      const filtered = characters.filter(character =>
        character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        character.element?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        character.region?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCharacters(filtered);
    }
  }, [searchTerm, characters]);

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/characters');
      if (response.ok) {
        const data = await response.json();
        const charactersArray = Array.isArray(data.data) ? data.data : data.data?.characters || data.characters || data || [];
        setCharacters(charactersArray);
        setFilteredCharacters(charactersArray);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterToggle = (characterId: string) => {
    if (multiple) {
      setSelectedIds(prev => 
        prev.includes(characterId) 
          ? prev.filter(id => id !== characterId)
          : [...prev, characterId]
      );
    } else {
      setSelectedIds([characterId]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedIds);
    onClose();
  };

  const handleCancel = () => {
    setSelectedIds(selectedCharacters);
    setSearchTerm('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <Button
            onClick={handleCancel}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-neutral-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Поиск по имени, стихии или региону..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-700 border-neutral-600 text-white"
            />
          </div>
        </div>

        {/* Characters Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Загрузка персонажей...</div>
          ) : filteredCharacters.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? 'Персонажи не найдены' : 'Нет доступных персонажей'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCharacters.map((character) => (
                <div
                  key={character.id}
                  onClick={() => handleCharacterToggle(character.id)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${selectedIds.includes(character.id)
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-neutral-700 border-neutral-600 hover:bg-neutral-600'
                    }
                  `}
                >
                  <div className="relative">
                    <OptimizedImage
                      src={getImageWithFallback(character.image, character.name, 'character')}
                      alt={character.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      type="character"
                    />
                    {selectedIds.includes(character.id) && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{character.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {character.element && (
                        <span className="px-2 py-1 bg-neutral-600 rounded text-xs">
                          {character.element}
                        </span>
                      )}
                      {character.rarity && (
                        <span className="text-yellow-400">★{character.rarity}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-700">
          <div className="text-sm text-gray-400">
            {multiple 
              ? `Выбрано: ${selectedIds.length} персонажей`
              : selectedIds.length > 0 
                ? `Выбран: ${characters.find(c => c.id === selectedIds[0])?.name}`
                : 'Персонаж не выбран'
            }
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-neutral-600 text-gray-400 hover:text-white"
            >
              Отмена
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={selectedIds.length === 0}
            >
              {multiple ? 'Выбрать персонажей' : 'Выбрать персонажа'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelectModal; 