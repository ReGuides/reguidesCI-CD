'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Character } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { AdminButton } from '@/components/ui/admin-button';
import { IconActionButton } from '@/components/ui/icon-action-button';
import { AddButton } from '@/components/ui/add-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import OptimizedImage from '@/components/ui/optimized-image';
import { 
  Plus, 
  Pencil, 
  Trash, 
  Search, 
  Eye,
  Star,
  Crown
} from 'lucide-react';
import { getImageWithFallback } from '@/lib/utils/imageUtils';

export default function CharactersAdminPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterElement, setFilterElement] = useState<string>('all');

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/characters');
      if (response.ok) {
        const data = await response.json();
        console.log('Characters data:', data);
        // Гарантируем, что всегда массив
        const charactersArray = Array.isArray(data.data) ? data.data : data.data?.characters || data.characters || data || [];
        console.log('Characters array:', charactersArray);
        setCharacters(charactersArray);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = filterRarity === 'all' || (character.rarity && character.rarity.toString() === filterRarity);
    const matchesElement = filterElement === 'all' || (character.element && character.element === filterElement);
    return matchesSearch && matchesRarity && matchesElement;
  });

  const getRarityColor = (rarity?: number) => {
    if (!rarity) return 'text-gray-400';
    switch (rarity) {
      case 5: return 'text-yellow-400';
      case 4: return 'text-purple-400';
      case 3: return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getElementColor = (element?: string) => {
    if (!element) return 'text-gray-400';
    switch (element) {
      case 'Pyro': return 'text-red-500';
      case 'Hydro': return 'text-blue-500';
      case 'Electro': return 'text-purple-500';
      case 'Cryo': return 'text-cyan-500';
      case 'Anemo': return 'text-green-500';
      case 'Geo': return 'text-yellow-600';
      case 'Dendro': return 'text-green-600';
      default: return 'text-gray-400';
    }
  };

  const handleAddCharacter = () => {
    router.push('/admin/characters/add');
  };

  const handleEditCharacter = (character: Character) => {
    console.log('Editing character:', character);
    console.log('Character ID:', character.id);
    // Используем только id
    const characterId = character.id;
    if (!characterId) {
      console.error('No id found for character:', character);
      return;
    }
    console.log('Navigating to:', `/admin/characters/${characterId}/edit`);
    router.push(`/admin/characters/${characterId}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Управление персонажами</h1>
        <AddButton 
          onClick={handleAddCharacter}
          variant="primary"
          size="lg"
          icon={<Plus />}
          iconPosition="left"
        >
          Добавить персонажа
        </AddButton>
      </div>

      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Input
            placeholder="Поиск персонажей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white h-11 text-base rounded-lg"
          />
        </div>
        <div>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="w-full h-11 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base"
          >
            <option value="all">Все редкости</option>
            <option value="5">5★</option>
            <option value="4">4★</option>
            <option value="3">3★</option>
          </select>
        </div>
        <div>
          <select
            value={filterElement}
            onChange={(e) => setFilterElement(e.target.value)}
            className="w-full h-11 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base"
          >
            <option value="all">Все элементы</option>
            <option value="Pyro">Пиро</option>
            <option value="Hydro">Гидро</option>
            <option value="Electro">Электро</option>
            <option value="Cryo">Крио</option>
            <option value="Anemo">Анемо</option>
            <option value="Geo">Гео</option>
            <option value="Dendro">Дендро</option>
          </select>
        </div>
        <div className="text-white flex items-center text-base font-medium">
          Всего: {filteredCharacters.length}
        </div>
      </div>

      {/* Список персонажей */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredCharacters.map((character, index) => {
          console.log('Rendering character:', character);
          return (
            <Card key={character._id || character.id || `character-${index}`} className="bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors rounded-xl min-h-[240px] flex flex-col justify-between p-4">
              <div className="flex items-start space-x-3 mb-2">
                <div className="relative">
                  <OptimizedImage
                    src={getImageWithFallback(character.image, character.name, 'character')}
                    alt={character.name}
                    className="w-12 h-12 rounded-full object-cover border border-neutral-700"
                    type="character"
                  />
                  {character.isFeatured && (
                    <Star className="w-5 h-5 text-yellow-400 absolute -top-2 -right-2" />
                  )}
                </div>
                <div>
                  <div className="text-white text-lg font-semibold leading-tight line-clamp-1">{character.name}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-base ${getElementColor(character.element)}`}>{character.element || '-'}</span>
                    <span className={`text-base ${getRarityColor(character.rarity)}`}>{character.rarity || '-'}★</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-1 text-base">
                  <div className="flex justify-between text-neutral-400">
                    <span>Роль:</span>
                    <span className="text-white">{character.role || '-'}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Оружие:</span>
                    <span className="text-white">{character.weaponType || character.weapon || '-'}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Регион:</span>
                    <span className="text-white">{character.region || '-'}</span>
                  </div>
                </div>
                {/* Кнопки действий */}
                <div className="mt-2 pt-2 border-t border-neutral-700 flex gap-2 justify-end">
                  <IconActionButton 
                    variant="view" 
                    icon={<Eye />} 
                    title="Просмотр"
                  />
                  <IconActionButton 
                    variant="edit" 
                    icon={<Pencil />} 
                    title="Редактировать"
                    onClick={() => handleEditCharacter(character)}
                  />
                  <IconActionButton 
                    variant="delete" 
                    icon={<Trash />} 
                    title="Удалить"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Персонажи не найдены</p>
        </div>
      )}
    </div>
  );
} 