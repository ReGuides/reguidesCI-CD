'use client';
import { useState, useEffect } from 'react';
import { Users, Star, Gem, Sword, Palette, ChevronDown, Search } from 'lucide-react';
import { Button } from './button';

interface Character {
  _id: string;
  name: string;
  image: string;
  element: string;
  rarity: number;
}

interface Talent {
  _id: string;
  name: string;
  type: string;
  description: string;
}

interface Artifact {
  _id: string;
  name: string;
  rarity: number;
  bonus: string;
}

interface Weapon {
  _id: string;
  name: string;
  type: string;
  rarity: number;
  passive: string;
}

interface GameToolbarProps {
  onInsertCharacter: (character: Character) => void;
  onInsertTalent: (talent: Talent) => void;
  onInsertArtifact: (artifact: Artifact) => void;
  onInsertWeapon: (weapon: Weapon) => void;
  onInsertElement: (element: { name: string; value: string; color: string; icon: string }) => void;
}

const elementColors = [
  { name: 'Пиро', value: 'pyro', color: '#ff6b35', icon: '🔥' },
  { name: 'Гидро', value: 'hydro', color: '#4fc3f7', icon: '💧' },
  { name: 'Крио', value: 'cryo', color: '#81d4fa', icon: '❄️' },
  { name: 'Анемо', value: 'anemo', color: '#81c784', icon: '💨' },
  { name: 'Дендро', value: 'dendro', color: '#8bc34a', icon: '🌱' },
  { name: 'Гео', value: 'geo', color: '#ffb74d', icon: '🪨' },
  { name: 'Электро', value: 'electro', color: '#ba68c8', icon: '⚡' }
];

export default function GameToolbar({ 
  onInsertCharacter, 
  onInsertTalent, 
  onInsertArtifact, 
  onInsertWeapon, 
  onInsertElement 
}: GameToolbarProps) {
  const [showCharacters, setShowCharacters] = useState(false);
  const [showTalents, setShowTalents] = useState(false);
  const [showArtifacts, setShowArtifacts] = useState(false);
  const [showWeapons, setShowWeapons] = useState(false);
  const [showElements, setShowElements] = useState(false);
  
  const [characters, setCharacters] = useState<Character[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [searchCharacters, setSearchCharacters] = useState('');
  const [searchTalents, setSearchTalents] = useState('');
  const [searchArtifacts, setSearchArtifacts] = useState('');
  const [searchWeapons, setSearchWeapons] = useState('');

  // Загружаем данные при монтировании
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем персонажей
        const charactersResponse = await fetch('/api/characters');
        if (charactersResponse.ok) {
          const charactersData = await charactersResponse.json();
          setCharacters(charactersData.data || charactersData || []);
        }

        // Загружаем артефакты
        const artifactsResponse = await fetch('/api/artifacts');
        if (artifactsResponse.ok) {
          const artifactsData = await artifactsResponse.json();
          setArtifacts(artifactsData.data || artifactsData || []);
        }

        // Загружаем оружия
        const weaponsResponse = await fetch('/api/weapons');
        if (weaponsResponse.ok) {
          const weaponsData = await weaponsResponse.json();
          setWeapons(weaponsData.data || weaponsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Загружаем таланты при выборе персонажа
  useEffect(() => {
    if (selectedCharacter) {
      const fetchTalents = async () => {
        try {
          const response = await fetch(`/api/characters/${selectedCharacter._id}/talents`);
          if (response.ok) {
            const talentsData = await response.json();
            setTalents(talentsData.talents || []);
          }
        } catch (error) {
          console.error('Error fetching talents:', error);
        }
      };

      fetchTalents();
    }
  }, [selectedCharacter]);

  const toggleDropdown = (dropdown: string) => {
    setShowCharacters(dropdown === 'characters' ? !showCharacters : false);
    setShowTalents(dropdown === 'talents' ? !showTalents : false);
    setShowArtifacts(dropdown === 'artifacts' ? !showArtifacts : false);
    setShowWeapons(dropdown === 'weapons' ? !showWeapons : false);
    setShowElements(dropdown === 'elements' ? !showElements : false);
  };

  const closeDropdowns = () => {
    setShowCharacters(false);
    setShowTalents(false);
    setShowArtifacts(false);
    setShowWeapons(false);
    setShowElements(false);
  };

  const insertCharacter = (character: Character) => {
    onInsertCharacter(character);
    closeDropdowns();
  };

  const insertTalent = (talent: Talent) => {
    onInsertTalent(talent);
    closeDropdowns();
  };

  const insertArtifact = (artifact: Artifact) => {
    onInsertArtifact(artifact);
    closeDropdowns();
  };

  const insertWeapon = (weapon: Weapon) => {
    onInsertWeapon(weapon);
    closeDropdowns();
  };

  const insertElement = (element: { name: string; value: string; color: string; icon: string }) => {
    onInsertElement(element);
    closeDropdowns();
  };

  const filteredCharacters = characters.filter(char => 
    char.name.toLowerCase().includes(searchCharacters.toLowerCase())
  );

  const filteredTalents = talents.filter(talent => 
    talent.name.toLowerCase().includes(searchTalents.toLowerCase())
  );

  const filteredArtifacts = artifacts.filter(artifact => 
    artifact.name.toLowerCase().includes(searchArtifacts.toLowerCase())
  );

  const filteredWeapons = weapons.filter(weapon => 
    weapon.name.toLowerCase().includes(searchWeapons.toLowerCase())
  );

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-neutral-800 rounded-lg border border-neutral-600">
      {/* Персонажи */}
      <div className="relative">
        <Button
          onClick={() => toggleDropdown('characters')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Персонажи
          <ChevronDown className="w-4 h-4" />
        </Button>
        
        {showCharacters && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-neutral-900 border border-neutral-600 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-neutral-600">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск персонажа..."
                  value={searchCharacters}
                  onChange={(e) => setSearchCharacters(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredCharacters.map((character) => (
                <button
                  key={character._id}
                  onClick={() => insertCharacter(character)}
                  className="w-full p-3 hover:bg-neutral-700 flex items-center gap-3 text-left transition-colors"
                >
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-white">{character.name}</div>
                    <div className="text-sm text-gray-400">{character.element} • {character.rarity}⭐</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Таланты */}
      <div className="relative">
        <Button
          onClick={() => toggleDropdown('talents')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Star className="w-4 h-4" />
          Таланты
          <ChevronDown className="w-4 h-4" />
        </Button>
        
        {showTalents && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-neutral-900 border border-neutral-600 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-neutral-600">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-300 mb-2">Выберите персонажа:</label>
                <select
                  value={selectedCharacter?._id || ''}
                  onChange={(e) => {
                    const character = characters.find(c => c._id === e.target.value);
                    setSelectedCharacter(character || null);
                  }}
                  className="w-full p-2 bg-neutral-800 border border-neutral-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Выберите персонажа...</option>
                  {characters.map((character) => (
                    <option key={character._id} value={character._id}>
                      {character.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedCharacter && (
                <>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск таланта..."
                      value={searchTalents}
                      onChange={(e) => setSearchTalents(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
            {selectedCharacter && (
              <div className="max-h-60 overflow-y-auto">
                {filteredTalents.map((talent) => (
                  <button
                    key={talent._id}
                    onClick={() => insertTalent(talent)}
                    className="w-full p-3 hover:bg-neutral-700 flex items-center gap-3 text-left transition-colors"
                  >
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-900" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{talent.name}</div>
                      <div className="text-sm text-gray-400">{talent.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Артефакты */}
      <div className="relative">
        <Button
          onClick={() => toggleDropdown('artifacts')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Gem className="w-4 h-4" />
          Артефакты
          <ChevronDown className="w-4 h-4" />
        </Button>
        
        {showArtifacts && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-neutral-900 border border-neutral-600 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-neutral-600">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск артефакта..."
                  value={searchArtifacts}
                  onChange={(e) => setSearchArtifacts(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredArtifacts.map((artifact) => (
                <button
                  key={artifact._id}
                  onClick={() => insertArtifact(artifact)}
                  className="w-full p-3 hover:bg-neutral-700 flex items-center gap-3 text-left transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Gem className="w-4 h-4 text-purple-900" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{artifact.name}</div>
                    <div className="text-sm text-gray-400">{artifact.rarity}⭐ • {artifact.bonus}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Оружия */}
      <div className="relative">
        <Button
          onClick={() => toggleDropdown('weapons')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Sword className="w-4 h-4" />
          Оружия
          <ChevronDown className="w-4 h-4" />
        </Button>
        
        {showWeapons && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-neutral-900 border border-neutral-600 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-neutral-600">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск оружия..."
                  value={searchWeapons}
                  onChange={(e) => setSearchWeapons(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredWeapons.map((weapon) => (
                <button
                  key={weapon._id}
                  onClick={() => insertWeapon(weapon)}
                  className="w-full p-3 hover:bg-neutral-700 flex items-center gap-3 text-left transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Sword className="w-4 h-4 text-orange-900" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{weapon.name}</div>
                    <div className="text-sm text-gray-400">{weapon.type} • {weapon.rarity}⭐</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Элементы */}
      <div className="relative">
        <Button
          onClick={() => toggleDropdown('elements')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Palette className="w-4 h-4" />
          Элементы
          <ChevronDown className="w-4 h-4" />
        </Button>
        
        {showElements && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-neutral-900 border border-neutral-600 rounded-lg shadow-lg z-50">
            <div className="p-2">
              {elementColors.map((element) => (
                <button
                  key={element.value}
                  onClick={() => insertElement(element)}
                  className="w-full p-2 hover:bg-neutral-700 flex items-center gap-2 text-left transition-colors rounded"
                >
                  <span className="text-lg">{element.icon}</span>
                  <span className="text-white">{element.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
