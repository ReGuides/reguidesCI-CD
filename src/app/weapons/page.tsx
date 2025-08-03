'use client';

import { useState, useEffect, useCallback } from 'react';
import { WeaponCard } from '@/components/weapon-card';
import { WeaponFilters } from '@/components/features/weapon-filters';
import { Weapon } from '@/types';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function WeaponsPage() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    rarity: 'all',
    search: ''
  });

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    const fetchWeapons = async () => {
      try {
        setLoading(true);
        
        const params = new URLSearchParams();
        if (filters.type !== 'all') params.append('type', filters.type);
        if (filters.rarity !== 'all') params.append('rarity', filters.rarity);
        if (filters.search) params.append('search', filters.search);

        const response = await fetch(`/api/weapons?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        setWeapons(data.data || []);
      } catch (err) {
        console.error('Error fetching weapons:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWeapons();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      <aside className="w-full md:w-64 flex-shrink-0">
        <WeaponFilters filters={filters} onFiltersChange={handleFiltersChange} />
      </aside>
      <main className="flex-1">
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
        {/* Weapons Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {weapons.map((weapon) => (
              <WeaponCard key={weapon.id} weapon={weapon} />
            ))}
          </div>
        )}
        {/* No Results */}
        {!loading && !error && weapons.length === 0 && (
          <div className="text-center text-text-secondary">
            <p>Оружие не найдено</p>
          </div>
        )}
      </main>
    </div>
  );
} 