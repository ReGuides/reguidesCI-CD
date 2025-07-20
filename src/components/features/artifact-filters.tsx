'use client';

import { useState, useEffect, useCallback } from 'react';

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
  const [filterOptions, setFilterOptions] = useState({
    types: [] as string[],
    rarities: [] as number[]
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/artifacts');
        if (response.ok) {
          const data = await response.json();
          setFilterOptions({
            types: data.filters?.types || [],
            rarities: data.filters?.rarities || []
          });
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, type: value });
  }, [filters, onFiltersChange]);

  const handleRarityChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, rarity: value });
  }, [filters, onFiltersChange]);

  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, search: value });
  }, [filters, onFiltersChange]);

  return (
    <div className="mb-8 bg-card rounded-lg shadow-md p-6 border border-neutral-700">
      <div className="flex flex-col gap-4">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Набор артефактов
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">Все наборы</option>
            {(filterOptions.types || []).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        {/* Rarity Filter */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Редкость
          </label>
          <select
            value={filters.rarity}
            onChange={(e) => handleRarityChange(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">Все редкости</option>
            {(filterOptions.rarities || []).map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}★
              </option>
            ))}
          </select>
        </div>
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Поиск
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Поиск артефактов..."
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>
    </div>
  );
} 