'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { WeaponCard } from '@/components/weapon-card';
import { WeaponFilters } from '@/components/features/weapon-filters';
import { Weapon } from '@/types';
import LoadingSpinner from '@/components/ui/loading-spinner';
import PageTitle from '@/components/ui/page-title';

export default function WeaponsPage() {
  return (
    <>
      <PageTitle title="Оружие" />
      <WeaponsPageContent />
    </>
  );
}

function WeaponsPageContent() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    sortBy: 'date' as 'date' | 'name'
  });

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    const fetchWeapons = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/weapons');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Исправляем извлечение данных из ответа API
        const weaponsData = data.data || data.weapons || data || [];
        const weaponsArray = Array.isArray(weaponsData) ? weaponsData : [];
        setWeapons(weaponsArray);
      } catch (err) {
        console.error('Error fetching weapons:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWeapons();
  }, []);

  // Фильтрация и сортировка оружия
  const filteredAndSortedWeapons = useMemo(() => {
    let result = [...weapons];

    // Фильтрация по названию
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(weapon => 
        weapon.name.toLowerCase().includes(searchLower)
      );
    }

    // Фильтрация по типу
    if (filters.type !== 'all') {
      result = result.filter(weapon => weapon.type === filters.type);
    }

    // Сортировка
    result.sort((a, b) => {
      if (filters.sortBy === 'date') {
        // По дате добавления (новые первыми)
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      } else {
        // По названию (А-Я)
        return a.name.localeCompare(b.name, 'ru');
      }
    });

    return result;
  }, [weapons, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 overflow-hidden">
      <aside className="w-full md:w-64 flex-shrink-0 min-w-0">
        <WeaponFilters filters={filters} onFiltersChange={handleFiltersChange} />
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
        {/* Weapons Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAndSortedWeapons.map((weapon) => (
              <WeaponCard key={weapon.id} weapon={weapon} />
            ))}
          </div>
        )}
        {/* No Results */}
        {!loading && !error && filteredAndSortedWeapons.length === 0 && (
          <div className="text-center text-text-secondary">
            <p>Оружие не найдено</p>
          </div>
        )}
      </main>
    </div>
  );
} 