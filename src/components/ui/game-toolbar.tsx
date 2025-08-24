'use client';

import { useState } from 'react';
import { 
  Users, 
  Star, 
  Gem, 
  Sword, 
  Palette,
  ChevronDown,
  Search
} from 'lucide-react';
import { Button } from './button';

interface GameToolbarProps {
  onInsertCharacter: (character: any) => void;
  onInsertTalent: (talent: any) => void;
  onInsertArtifact: (artifact: any) => void;
  onInsertWeapon: (weapon: any) => void;
  onInsertElement: (element: string) => void;
}

const elementColors = [
  { name: 'Пиро', value: 'pyro', color: '#ff6b35', icon: '🔥' },
  { name: 'Гидро', value: 'hydro', color: '#4fc3f7', icon: '💧' },
  { name: 'Крио', value: 'cryo', color: '#81d4fa', icon: '❄️' },
  { name: 'Анемо', value: 'anemo', color: '#81c784', icon: '💨' },
  { name: 'Дендро', value: 'dendro', color: '#8bc34a', icon: '🌱' },
  { name: 'Гео', value: 'geo', color: '#ffb74d', icon: '🪨' },
];

export default function GameToolbar({ 
  onInsertCharacter, 
  onInsertTalent, 
  onInsertArtifact, 
  onInsertWeapon, 
  onInsertElement 
}: GameToolbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    setSearchTerm('');
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
    setSearchTerm('');
  };

  // Заглушки для данных (потом заменим на реальные API)
  const mockCharacters = [
    { id: 'raiden', name: 'Райден', element: 'electro', rarity: 5, image: '/characters/raiden.png' },
    { id: 'zhongli', name: 'Чжун Ли', element: 'geo', rarity: 5, image: '/characters/zhongli.png' },
    { id: 'venti', name: 'Венти', element: 'anemo', rarity: 5, image: '/characters/venti.png' },
  ];

  const mockTalents = [
    { id: 'raiden-skill', name: 'Электро-глаз', type: 'skill', description: 'Создает Электро-глаз' },
    { id: 'zhongli-burst', name: 'Планетарное разрушение', type: 'burst', description: 'Мощная атака' },
  ];

  const mockArtifacts = [
    { id: 'emblem', name: 'Эмблема разбитой судьбы', rarity: 5, bonus: 'Энергия +20%' },
    { id: 'archaic', name: 'Архаичный камень', rarity: 5, bonus: 'Гео урон +15%' },
  ];

  const mockWeapons = [
    { id: 'engulfing', name: 'Поглощающая молния', type: 'polearm', rarity: 5, passive: 'Восстанавливает энергию' },
    { id: 'staff', name: 'Посох Хомы', type: 'polearm', rarity: 5, passive: 'Увеличивает HP' },
  ];

  const insertCharacter = (character: any) => {
    const html = `<span class="character-card" data-character-id="${character.id}">
      <img src="${character.image}" alt="${character.name}" class="w-6 h-6 rounded-full inline-block mr-2" />
      <strong>${character.name}</strong>
    </span>`;
    onInsertCharacter(character);
    closeDropdowns();
  };

  const insertTalent = (talent: any) => {
    const html = `<span class="talent-info" data-talent-id="${talent.id}">
      <span class="talent-icon">⭐</span> <strong>${talent.name}</strong> (${talent.type})
    </span>`;
    onInsertTalent(talent);
    closeDropdowns();
  };

  const insertArtifact = (artifact: any) => {
    const html = `<span class="artifact-info" data-artifact-id="${artifact.id}">
      <span class="artifact-icon">💎</span> <strong>${artifact.name}</strong> - ${artifact.bonus}
    </span>`;
    onInsertArtifact(artifact);
    closeDropdowns();
  };

  const insertWeapon = (weapon: any) => {
    const html = `<span class="weapon-info" data-weapon-id="${weapon.id}">
      <span class="weapon-icon">⚔️</span> <strong>${weapon.name}</strong> (${weapon.type})
    </span>`;
    onInsertWeapon(weapon);
    closeDropdowns();
  };

  const insertElement = (element: any) => {
    const html = `<span class="element-badge" style="color: ${element.color}">
      ${element.icon} <strong>${element.name}</strong>
    </span>`;
    onInsertElement(element.value);
    closeDropdowns();
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-neutral-800 rounded-lg border border-neutral-600">
      {/* Персонажи */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => toggleDropdown('characters')}
          className="h-8 px-3 border-neutral-600 hover:bg-neutral-600"
        >
          <Users className="w-3 h-3 mr-1" />
          Персонажи
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
        
        {activeDropdown === 'characters' && (
          <div className="absolute top-full left-0 mt-2 bg-neutral-800 border border-neutral-600 rounded-lg p-3 z-30 shadow-xl min-w-[250px]">
            <div className="mb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск персонажей..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mockCharacters
                .filter(char => char.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(character => (
                  <button
                    key={character.id}
                    onClick={() => insertCharacter(character)}
                    className="w-full flex items-center p-2 hover:bg-neutral-700 rounded transition-colors"
                  >
                    <img src={character.image} alt={character.name} className="w-8 h-8 rounded-full mr-3" />
                    <div className="text-left">
                      <div className="text-white font-medium">{character.name}</div>
                      <div className="text-xs text-gray-400">{character.element} • {character.rarity}⭐</div>
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
          type="button"
          variant="outline"
          size="sm"
          onClick={() => toggleDropdown('talents')}
          className="h-8 px-3 border-neutral-600 hover:bg-neutral-600"
        >
          <Star className="w-3 h-3 mr-1" />
          Таланты
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
        
        {activeDropdown === 'talents' && (
          <div className="absolute top-full left-0 mt-2 bg-neutral-800 border border-neutral-600 rounded-lg p-3 z-30 shadow-xl min-w-[250px]">
            <div className="mb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск талантов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mockTalents
                .filter(talent => talent.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(talent => (
                  <button
                    key={talent.id}
                    onClick={() => insertTalent(talent)}
                    className="w-full text-left p-2 hover:bg-neutral-700 rounded transition-colors"
                  >
                    <div className="text-white font-medium">{talent.name}</div>
                    <div className="text-xs text-gray-400">{talent.type} • {talent.description}</div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Артефакты */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => toggleDropdown('artifacts')}
          className="h-8 px-3 border-neutral-600 hover:bg-neutral-600"
        >
          <Gem className="w-3 h-3 mr-1" />
          Артефакты
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
        
        {activeDropdown === 'artifacts' && (
          <div className="absolute top-full left-0 mt-2 bg-neutral-800 border border-neutral-600 rounded-lg p-3 z-30 shadow-xl min-w-[250px]">
            <div className="mb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск артефактов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mockArtifacts
                .filter(artifact => artifact.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(artifact => (
                  <button
                    key={artifact.id}
                    onClick={() => insertArtifact(artifact)}
                    className="w-full text-left p-2 hover:bg-neutral-700 rounded transition-colors"
                  >
                    <div className="text-white font-medium">{artifact.name}</div>
                    <div className="text-xs text-gray-400">{artifact.rarity}⭐ • {artifact.bonus}</div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Оружие */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => toggleDropdown('weapons')}
          className="h-8 px-3 border-neutral-600 hover:bg-neutral-600"
        >
          <Sword className="w-3 h-3 mr-1" />
          Оружие
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
        
        {activeDropdown === 'weapons' && (
          <div className="absolute top-full left-0 mt-2 bg-neutral-800 border border-neutral-600 rounded-lg p-3 z-30 shadow-xl min-w-[250px]">
            <div className="mb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск оружия..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mockWeapons
                .filter(weapon => weapon.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(weapon => (
                  <button
                    key={weapon.id}
                    onClick={() => insertWeapon(weapon)}
                    className="w-full text-left p-2 hover:bg-neutral-700 rounded transition-colors"
                  >
                    <div className="text-white font-medium">{weapon.name}</div>
                    <div className="text-xs text-gray-400">{weapon.type} • {weapon.rarity}⭐</div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Элементы */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => toggleDropdown('elements')}
          className="h-8 px-3 border-neutral-600 hover:bg-neutral-600"
        >
          <Palette className="w-3 h-3 mr-1" />
          Элементы
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
        
        {activeDropdown === 'elements' && (
          <div className="absolute top-full left-0 mt-2 bg-neutral-800 border border-neutral-600 rounded-lg p-3 z-30 shadow-xl min-w-[200px]">
            <div className="grid grid-cols-2 gap-2">
              {elementColors.map(element => (
                <button
                  key={element.value}
                  onClick={() => insertElement(element)}
                  className="p-2 hover:bg-neutral-700 rounded transition-colors text-center"
                  style={{ color: element.color }}
                >
                  <div className="text-lg">{element.icon}</div>
                  <div className="text-xs font-medium">{element.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
