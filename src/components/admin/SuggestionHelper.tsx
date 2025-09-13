'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SuggestionHelperProps {
  onInsert: (text: string) => void;
  onClose: () => void;
  characterId?: string;
}

type SuggestionType = 'weapon' | 'artifact' | 'character' | 'talent' | 'constellation';

interface Weapon {
  id: string;
  name: string;
  type: string;
  rarity: number;
}

interface Artifact {
  id: string;
  name: string;
  rarity: number[];
}

interface Character {
  id: string;
  name: string;
  element: string;
  weaponType: string;
  rarity: number;
}

interface Talent {
  _id?: string;
  name: string;
  type: string;
  description: string;
  scaling?: {
    [key: string]: {
      [level: string]: string;
    };
  };
}

interface Constellation {
  level: number;
  name: string;
  description: string;
}

const SuggestionHelper: React.FC<SuggestionHelperProps> = ({ onInsert, characterId }) => {
  const [selectedType, setSelectedType] = useState<SuggestionType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Загружаем оружия
        const weaponsResponse = await fetch('/api/weapons');
        if (weaponsResponse.ok) {
          const weaponsData = await weaponsResponse.json();
          const weaponsArray = Array.isArray(weaponsData) ? weaponsData : [];
          setWeapons(weaponsArray);
        }

        // Загружаем артефакты
        const artifactsResponse = await fetch('/api/artifacts');
        if (artifactsResponse.ok) {
          const artifactsData = await artifactsResponse.json();
          const artifactsArray = Array.isArray(artifactsData) ? artifactsData : [];
          setArtifacts(artifactsArray);
        }

        // Загружаем персонажей
        const charactersResponse = await fetch('/api/characters-simple');
        if (charactersResponse.ok) {
          const charactersData = await charactersResponse.json();
          const charactersArray = Array.isArray(charactersData) ? charactersData : [];
          setCharacters(charactersArray);
        }

        // Загружаем таланты и созвездия если есть characterId
        if (characterId) {
          console.log('SuggestionHelper: Loading talents for characterId:', characterId);
          const talentsResponse = await fetch(`/api/characters/${characterId}/talents`);
          if (talentsResponse.ok) {
            const talentsData = await talentsResponse.json();
            console.log('SuggestionHelper: Loaded talents data:', talentsData);
            setTalents(talentsData.talents || []);
          } else {
            console.error('SuggestionHelper: Failed to load talents:', talentsResponse.status);
          }

          const constellationsResponse = await fetch(`/api/characters/${characterId}/constellations`);
          if (constellationsResponse.ok) {
            const constellationsData = await constellationsResponse.json();
            setConstellations(constellationsData.constellations || []);
          }
        }
      } catch (error) {
        console.error('SuggestionHelper: Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Обработчики событий для обновления данных
    const handleTalentsUpdated = (event: CustomEvent) => {
      if (event.detail.characterId === characterId) {
        fetch(`/api/characters/${characterId}/talents`)
          .then(response => response.json())
          .then(data => {
            const talentsArray = Array.isArray(data.talents) ? data.talents : [];
            setTalents(talentsArray);
          });
      }
    };

    const handleConstellationsUpdated = (event: CustomEvent) => {
      if (event.detail.characterId === characterId) {
        fetch(`/api/characters/${characterId}/constellations`)
          .then(response => response.json())
          .then(data => {
            const constellationsArray = Array.isArray(data.constellations) ? data.constellations : [];
            setConstellations(constellationsArray);
          });
      }
    };

    window.addEventListener('talentsUpdated', handleTalentsUpdated as EventListener);
    window.addEventListener('constellationsUpdated', handleConstellationsUpdated as EventListener);

    return () => {
      window.removeEventListener('talentsUpdated', handleTalentsUpdated as EventListener);
      window.removeEventListener('constellationsUpdated', handleConstellationsUpdated as EventListener);
    };
  }, [characterId]);

  // Фильтрация результатов поиска
  const filteredItems = React.useMemo(() => {
    if (!selectedType) return [];

    const query = searchQuery.toLowerCase();
    
    switch (selectedType) {
      case 'weapon':
        return (Array.isArray(weapons) ? weapons : []).filter(weapon => 
          weapon.name.toLowerCase().includes(query) ||
          weapon.id.toLowerCase().includes(query)
        ).slice(0, 10);
      
      case 'artifact':
        return (Array.isArray(artifacts) ? artifacts : []).filter(artifact => 
          artifact.name.toLowerCase().includes(query) ||
          artifact.id.toLowerCase().includes(query)
        ).slice(0, 10);
      
      case 'character':
        return (Array.isArray(characters) ? characters : []).filter(character => 
          character.name.toLowerCase().includes(query) ||
          character.id.toLowerCase().includes(query)
        ).slice(0, 10);
      
      case 'talent':
        return (Array.isArray(talents) ? talents : []).filter(talent => 
          !query || 
          talent.name.toLowerCase().includes(query) ||
          talent.type.toLowerCase().includes(query) ||
          (talent._id && talent._id.toLowerCase().includes(query))
        );
      
      case 'constellation':
        return (Array.isArray(constellations) ? constellations : []).filter(constellation => 
          !query || 
          constellation.name.toLowerCase().includes(query) ||
          constellation.level.toString().includes(query)
        );
      
      default:
        return [];
    }
  }, [selectedType, searchQuery, weapons, artifacts, characters, talents, constellations]);

  // Фокус на поле поиска при выборе типа
  useEffect(() => {
    if (selectedType && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [selectedType]);

  const handleTypeSelect = (type: SuggestionType) => {
    setSelectedType(type);
    setSearchQuery('');
    setIsOpen(true);
  };

  const handleItemSelect = (item: Weapon | Artifact | Character | Talent | Constellation) => {
    let html = '';
    
    switch (selectedType) {
      case 'weapon':
        const weapon = item as Weapon;
        if (weapon.name && weapon.id) {
          html = `<a href="/weapons/${weapon.id}" class="weapon-info inline-flex items-center gap-2 px-2 py-1 rounded border border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 transition-colors text-orange-400 hover:text-orange-300 no-underline">
            <span class="weapon-icon">⚔️</span> 
            <strong>${weapon.name}</strong> 
            <span class="text-xs text-gray-400">${weapon.type} ${weapon.rarity}⭐</span>
          </a>`;
        }
        break;
      case 'artifact':
        const artifact = item as Artifact;
        if (artifact.name && artifact.id) {
          html = `<a href="/artifacts/${artifact.id}" class="artifact-info inline-flex items-center gap-2 px-2 py-1 rounded border border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 transition-colors text-purple-400 hover:text-purple-300 no-underline">
            <span class="artifact-icon">💎</span> 
            <strong>${artifact.name}</strong> 
            <span class="text-xs text-gray-400">${Array.isArray(artifact.rarity) ? artifact.rarity.join(', ') : 'N/A'}⭐</span>
          </a>`;
        }
        break;
      case 'character':
        const character = item as Character;
        if (character.name && character.id) {
          const elementColors: { [key: string]: string } = {
            'Пиро': '#ff6b6b',
            'Гидро': '#4fc3f7', 
            'Электро': '#ba68c8',
            'Крио': '#81d4fa',
            'Анемо': '#81c784',
            'Гео': '#a1887f',
            'Дендро': '#66bb6a'
          };
          const elementColor = elementColors[character.element] || '#ffffff';
          html = `<a href="/characters/${character.id}" class="character-card inline-flex items-center gap-2 px-2 py-1 rounded border transition-colors no-underline" style="border-color: ${elementColor}; background: ${elementColor}20; color: ${elementColor};">
            <span class="character-icon">👤</span> 
            <strong>${character.name}</strong> 
            <span class="text-xs text-gray-400">${character.element} • ${character.weaponType} • ${character.rarity}⭐</span>
          </a>`;
        }
        break;
      case 'talent':
        const talent = item as Talent;
        if (talent.name) {
          const talentIcons: { [key: string]: string } = {
            'normal': '⚔️',
            'skill': '✨',
            'burst': '💥',
            'passive': '⭐'
          };
          const talentIcon = talentIcons[talent.type] || '⭐';
          const talentId = talent._id || talent.type;
          html = `<span class="talent-info inline-flex items-center gap-2 px-2 py-1 rounded border border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors text-yellow-400 hover:text-yellow-300 cursor-pointer" data-talent-id="${talentId}" data-talent-type="${talent.type}">
            <span class="talent-icon">${talentIcon}</span> 
            <strong>${talent.name}</strong>
            <span class="text-xs text-gray-400">${talent.type === 'normal' ? 'Обычная атака' :
              talent.type === 'skill' ? 'Элементальный навык' :
              talent.type === 'burst' ? 'Взрыв стихии' :
              talent.type === 'passive' ? 'Пассивный талант' : talent.type}</span>
          </span>`;
        }
        break;
      case 'constellation':
        const constellation = item as Constellation;
        if (constellation.name && constellation.level) {
          html = `<span class="constellation-info inline-flex items-center gap-2 px-2 py-1 rounded border border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors text-cyan-400 hover:text-cyan-300 cursor-pointer" data-constellation-level="${constellation.level}">
            <span class="constellation-icon">🌟</span> 
            <strong>${constellation.name}</strong>
            <span class="text-xs text-gray-400">Созвездие ${constellation.level}</span>
          </span>`;
        }
        break;
    }
    
    if (html) {
      onInsert(html);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    setSearchQuery('');
    setIsOpen(false);
  };

  // Функция для генерации уникального ключа
  const getUniqueKey = (item: Weapon | Artifact | Character | Talent | Constellation) => {
    switch (selectedType) {
      case 'weapon':
        const weapon = item as Weapon;
        return `weapon-${weapon.id || weapon.name || 'unknown'}`;
      case 'artifact':
        const artifact = item as Artifact;
        return `artifact-${artifact.id || artifact.name || 'unknown'}`;
      case 'character':
        const character = item as Character;
        return `character-${character.id || character.name || 'unknown'}`;
      case 'talent':
        const talent = item as Talent;
        return `talent-${talent.type || 'unknown'}-${talent.name || 'unknown'}`;
      case 'constellation':
        const constellation = item as Constellation;
        return `constellation-${constellation.level || 'unknown'}`;
      default:
        return 'unknown';
    }
  };

  if (!isOpen) {
    return (
      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
        >
          💡 Подсказки для ссылок
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-2 p-4 bg-neutral-800 rounded-lg border border-gray-700">
        <div className="text-center text-gray-400">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div 
      className="bg-neutral-800 rounded-lg p-4 border border-gray-700 shadow-lg relative"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg font-medium focus:outline-none"
        aria-label="Закрыть"
      >
        ×
      </button>
      
      <h3 className="text-lg font-bold text-white mb-4">Подсказки для спец-ссылок</h3>
      
      {!selectedType ? (
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
          <p className="text-gray-300 mb-4">Выберите тип элемента для поиска:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTypeSelect('weapon');
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              className="p-4 bg-neutral-700 hover:bg-neutral-600 rounded-lg border border-neutral-600 hover:border-blue-500 transition-colors text-left"
            >
              <div className="text-blue-400 text-lg mb-1">⚔️</div>
              <div className="font-semibold text-white">Оружие</div>
              <div className="text-sm text-gray-400">Мечи, луки, катаны и др.</div>
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTypeSelect('artifact');
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              className="p-4 bg-neutral-700 hover:bg-neutral-600 rounded-lg border border-neutral-600 hover:border-purple-500 transition-colors text-left"
            >
              <div className="text-purple-400 text-lg mb-1">💎</div>
              <div className="font-semibold text-white">Артефакты</div>
              <div className="text-sm text-gray-400">Сеты артефактов</div>
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTypeSelect('character');
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              className="p-4 bg-neutral-700 hover:bg-neutral-600 rounded-lg border border-neutral-600 hover:border-green-500 transition-colors text-left"
            >
              <div className="text-green-400 text-lg mb-1">👤</div>
              <div className="font-semibold text-white">Персонажи</div>
              <div className="text-sm text-gray-400">Герои Genshin Impact</div>
            </button>
            
            {characterId && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTypeSelect('talent');
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  className="p-4 bg-neutral-700 hover:bg-neutral-600 rounded-lg border border-neutral-600 hover:border-yellow-500 transition-colors text-left"
                >
                  <div className="text-yellow-400 text-lg mb-1">⭐</div>
                  <div className="font-semibold text-white">Таланты</div>
                  <div className="text-sm text-gray-400">Навыки персонажа</div>
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTypeSelect('constellation');
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  className="p-4 bg-neutral-700 hover:bg-neutral-600 rounded-lg border border-neutral-600 hover:border-cyan-500 transition-colors text-left"
                >
                  <div className="text-cyan-400 text-lg mb-1">🌟</div>
                  <div className="font-semibold text-white">Созвездия</div>
                  <div className="text-sm text-gray-400">Созвездия персонажа</div>
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedType(null);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-white"
            >
              ← Назад
            </button>
            <span className="text-gray-300">
              {selectedType === 'weapon' && 'Поиск оружия:'}
              {selectedType === 'artifact' && 'Поиск артефактов:'}
              {selectedType === 'character' && 'Поиск персонажей:'}
              {selectedType === 'talent' && 'Таланты персонажа:'}
              {selectedType === 'constellation' && 'Созвездия персонажа:'}
            </span>
          </div>
          
          <input
            ref={searchInputRef}
            type="text"
            placeholder={`Введите название ${selectedType === 'weapon' ? 'оружия' : 
              selectedType === 'artifact' ? 'артефакта' : 
              selectedType === 'character' ? 'персонажа' :
              selectedType === 'talent' ? 'таланта' :
              selectedType === 'constellation' ? 'созвездия' : 'элемента'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
          
          <div className="max-h-64 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {filteredItems.length > 0 ? (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <button
                    key={getUniqueKey(item)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleItemSelect(item);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    className="w-full p-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg border border-neutral-600 hover:border-blue-500 transition-colors text-left"
                  >
                    <div className="font-semibold text-white">
                      {selectedType === 'weapon' && (item as Weapon).name}
                      {selectedType === 'artifact' && (item as Artifact).name}
                      {selectedType === 'character' && (item as Character).name}
                      {selectedType === 'talent' && (item as Talent).name}
                      {selectedType === 'constellation' && (item as Constellation).name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {selectedType === 'weapon' && `ID: ${(item as Weapon).id || 'N/A'}`}
                      {selectedType === 'artifact' && `ID: ${(item as Artifact).id || 'N/A'}`}
                      {selectedType === 'character' && `ID: ${(item as Character).id || 'N/A'}`}
                      {selectedType === 'talent' && `Тип: ${(item as Talent).type || 'N/A'}`}
                      {selectedType === 'constellation' && `Уровень: ${(item as Constellation).level || 'N/A'}`}
                    </div>
                    {selectedType === 'weapon' && (
                      <div className="text-xs text-gray-500">
                        {(item as Weapon).type || 'N/A'} • {(item as Weapon).rarity || 'N/A'}★
                      </div>
                    )}
                    {selectedType === 'artifact' && (
                      <div className="text-xs text-gray-500">
                        {Array.isArray((item as Artifact).rarity) ? (item as Artifact).rarity.join(', ') : 'N/A'}★
                      </div>
                    )}
                    {selectedType === 'character' && (
                      <div className="text-xs text-gray-500">
                        {(item as Character).element || 'N/A'} • {(item as Character).weaponType || 'N/A'} • {(item as Character).rarity || 'N/A'}★
                      </div>
                    )}
                    {selectedType === 'talent' && (
                      <div className="text-xs text-gray-500">
                        {(item as Talent).type === 'normal' ? 'Обычная атака' :
                         (item as Talent).type === 'skill' ? 'Элементальный навык' :
                         (item as Talent).type === 'burst' ? 'Взрыв стихии' :
                         (item as Talent).type === 'passive' ? 'Пассивный талант' : (item as Talent).type || 'N/A'}
                        {(item as Talent).scaling && Object.keys((item as Talent).scaling || {}).length > 0 && (
                          <span className="ml-2 text-blue-400">• Масштабирование</span>
                        )}
                      </div>
                    )}
                    {selectedType === 'constellation' && (
                      <div className="text-xs text-gray-500">
                        Созвездие {(item as Constellation).level || 'N/A'}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                {selectedType === 'talent' || selectedType === 'constellation' 
                  ? `Нет данных о ${selectedType === 'talent' ? 'талантах' : 'созвездиях'} для этого персонажа`
                  : 'Ничего не найдено'
                }
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionHelper; 