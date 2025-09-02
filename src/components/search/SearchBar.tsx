'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { WeaponModal } from '@/components/weapon-modal';
import { ArtifactModal } from '@/components/artifact-modal';
import { Weapon } from '@/types';
import { Artifact } from '@/types';

interface SearchResult {
  id: string;
  name: string;
  type: 'character' | 'weapon' | 'artifact';
  image?: string;
  rarity?: number;
  element?: string;
  weaponType?: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({ placeholder = "Поиск персонажей, оружия, артефактов...", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isWeaponModalOpen, setIsWeaponModalOpen] = useState(false);
  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
          if (response.ok) {
            const data = await response.json();
            setResults(data.results);
            setShowResults(true);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleResultClick = async (result: SearchResult) => {
    setShowResults(false);
    setQuery('');

    if (result.type === 'character') {
      router.push(`/characters/${result.id}`);
    } else if (result.type === 'weapon') {
      // Загружаем полные данные оружия и открываем модальное окно
      try {
        const response = await fetch(`/api/weapons/${result.id}`);
        if (response.ok) {
          const weapon = await response.json();
          setSelectedWeapon(weapon);
          setIsWeaponModalOpen(true);
        }
      } catch (error) {
        console.error('Error loading weapon:', error);
      }
    } else if (result.type === 'artifact') {
      // Загружаем полные данные артефакта и открываем модальное окно
      try {
        const response = await fetch(`/api/artifacts/${result.id}`);
        if (response.ok) {
          const artifact = await response.json();
          setSelectedArtifact(artifact);
          setIsArtifactModalOpen(true);
        }
      } catch (error) {
        console.error('Error loading artifact:', error);
      }
    }
  };

  const getRarityStars = (rarity: number) => {
    return Array.from({ length: rarity }, (_, i) => (
      <span key={i} className="text-yellow-400">★</span>
    ));
  };

  const getElementIcon = (element: string) => {
    const elementIcons: Record<string, string> = {
      'Pyro': '🔥',
      'Hydro': '💧',
      'Electro': '⚡',
      'Cryo': '❄️',
      'Anemo': '💨',
      'Geo': '🪨',
      'Dendro': '🌱'
    };
    return elementIcons[element] || '';
  };

  const groupResults = () => {
    const grouped = {
      characters: results.filter(r => r.type === 'character'),
      weapons: results.filter(r => r.type === 'weapon'),
      artifacts: results.filter(r => r.type === 'artifact')
    };
    return grouped;
  };

  const groupedResults = groupResults();

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent"
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Результаты поиска */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-neutral-400">
              Поиск...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-neutral-400">
              Ничего не найдено
            </div>
          ) : (
            <div className="py-2">
              {/* Персонажи */}
              {groupedResults.characters.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-neutral-800 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Персонажи
                  </div>
                  {groupedResults.characters.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-800 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-700 flex-shrink-0">
                        {result.image ? (
                          <Image
                            src={result.image}
                            alt={result.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/images/characters/default.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-600 flex items-center justify-center text-neutral-400">
                            👤
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{result.name}</div>
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          {result.element && (
                            <span className="flex items-center gap-1">
                              {getElementIcon(result.element)}
                              {result.element}
                            </span>
                          )}
                          {result.rarity && (
                            <div className="flex gap-1">
                              {getRarityStars(result.rarity)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Оружие */}
              {groupedResults.weapons.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-neutral-800 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Оружие
                  </div>
                  {groupedResults.weapons.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-800 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-700 flex-shrink-0">
                        {result.image ? (
                          <Image
                            src={result.image}
                            alt={result.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/images/weapons/default.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-600 flex items-center justify-center text-neutral-400">
                            ⚔️
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{result.name}</div>
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          {result.weaponType && (
                            <span>{result.weaponType}</span>
                          )}
                          {result.rarity && (
                            <div className="flex gap-1">
                              {getRarityStars(result.rarity)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Артефакты */}
              {groupedResults.artifacts.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-neutral-800 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Артефакты
                  </div>
                  {groupedResults.artifacts.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-800 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-700 flex-shrink-0">
                        {result.image ? (
                          <Image
                            src={result.image}
                            alt={result.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/images/artifacts/default.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-600 flex items-center justify-center text-neutral-400">
                            💎
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{result.name}</div>
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          {result.rarity && (
                            <div className="flex gap-1">
                              {getRarityStars(result.rarity)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Модальные окна */}
      <WeaponModal
        weapon={selectedWeapon}
        isOpen={isWeaponModalOpen}
        onClose={() => {
          setIsWeaponModalOpen(false);
          setSelectedWeapon(null);
        }}
      />

      <ArtifactModal
        artifact={selectedArtifact}
        isOpen={isArtifactModalOpen}
        onClose={() => {
          setIsArtifactModalOpen(false);
          setSelectedArtifact(null);
        }}
      />
    </div>
  );
}
