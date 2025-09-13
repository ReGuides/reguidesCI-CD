'use client';

import { useState, useEffect, useCallback } from 'react';
import { CharacterCard } from '@/components/character-card';
import { CharacterFilters } from '@/components/features/character-filters';
import { Character } from '@/types';
import LoadingSpinner from '@/components/ui/loading-spinner';
import PageTitle from '@/components/ui/page-title';
import TravelerCard from '@/components/traveler/TravelerCard';

export default function CharactersPage() {
  return (
    <>
      <PageTitle title="Персонажи" />
      <CharactersPageContent />
    </>
  );
}

function CharactersPageContent() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    element: 'all',
    weapon: 'all',
    rarity: 'all',
    region: 'all',
    search: ''
  });

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        console.log('Fetching characters with filters:', filters);
        
        const params = new URLSearchParams();
        if (filters.element !== 'all') params.append('element', filters.element);
        if (filters.weapon !== 'all') params.append('weapon', filters.weapon);
        if (filters.rarity !== 'all') params.append('rarity', filters.rarity);
        if (filters.region !== 'all') params.append('region', filters.region);
        if (filters.search) params.append('search', filters.search);

        const response = await fetch(`/api/characters?${params.toString()}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Characters data:', data);
        
        setCharacters(data.data || []);
      } catch (err) {
        console.error('Error fetching characters:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 overflow-hidden">
      <aside className="w-full md:w-64 flex-shrink-0 min-w-0">
        <CharacterFilters filters={filters} onFiltersChange={handleFiltersChange} />
      </aside>
      <main className="flex-1 min-w-0">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" className="text-accent" />
          </div>
        )}
        {/* Error State */}
        {error && (
          <div className="text-center text-red-400">
            <h2 className="text-2xl font-bold mb-4">Ошибка загрузки</h2>
            <p>{error}</p>
          </div>
        )}
        {/* Characters Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {/* Карточка главного персонажа */}
            <TravelerCard />
            {characters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}
        {/* No Results */}
        {!loading && !error && characters.length === 0 && (
          <div className="text-center text-text-secondary">
            <p>Персонажи не найдены</p>
          </div>
        )}
      </main>
    </div>
  );
} 