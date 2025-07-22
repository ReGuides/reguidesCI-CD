'use client';

import { useEffect } from 'react';

interface Filters {
  type: string;
  rarity: string;
  search: string;
}

interface ArtifactFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function ArtifactFilters({ filters, onFiltersChange }: ArtifactFiltersProps) {
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/artifacts');
        if (response.ok) {
          await response.json();
          // Удаляю неиспользуемые переменные и функции
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  return (
    <div className="mb-8 bg-card rounded-lg shadow-md p-6 border border-neutral-700">
      <div className="flex flex-col gap-4">
        {/* Search Only */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Поиск
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Поиск артефактов..."
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>
    </div>
  );
} 