'use client';

import { useState, useEffect, useCallback } from 'react';

interface Filters {
  element: string;
  weapon: string;
  rarity: string;
  region: string;
  search: string;
}

interface CharacterFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function CharacterFilters({ filters, onFiltersChange }: CharacterFiltersProps) {
  const [filterOptions, setFilterOptions] = useState({
    elements: [] as string[],
    weapons: [] as string[],
    rarities: [] as number[],
    regions: [] as string[]
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/characters');
        if (response.ok) {
          const data = await response.json();
          setFilterOptions({
            elements: data.filters?.elements || [],
            weapons: data.filters?.weapons || [],
            rarities: data.filters?.rarities || [],
            regions: data.filters?.regions || []
          });
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleElementChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, element: value });
  }, [filters, onFiltersChange]);

  const handleWeaponChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, weapon: value });
  }, [filters, onFiltersChange]);

  const handleRarityChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, rarity: value });
  }, [filters, onFiltersChange]);

  const handleRegionChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, region: value });
  }, [filters, onFiltersChange]);

  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, search: value });
  }, [filters, onFiltersChange]);

  return (
    <div className="mb-8 bg-card rounded-lg shadow-md p-6 border border-neutral-700">
      <div className="flex flex-col gap-4">
        {/* Element Filter */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Стихия
          </label>
          <select
            value={filters.element}
            onChange={(e) => handleElementChange(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">Все стихии</option>
            {(filterOptions.elements || []).map((element) => (
              <option key={element} value={element}>
                {element}
              </option>
            ))}
          </select>
        </div>
        {/* Weapon Filter */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Оружие
          </label>
          <select
            value={filters.weapon}
            onChange={(e) => handleWeaponChange(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">Все оружия</option>
            {(filterOptions.weapons || []).map((weapon) => {
              // Убеждаемся, что weapon - это строка
              const weaponValue = typeof weapon === 'string' ? weapon : (weapon as any)?.name || (weapon as any)?.id || 'Unknown';
              return (
                <option key={weaponValue} value={weaponValue}>
                  {weaponValue}
                </option>
              );
            })}
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
                {Number(rarity)}★
              </option>
            ))}
          </select>
        </div>
        {/* Region Filter */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Регион
          </label>
          <select
            value={filters.region}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">Все регионы</option>
            {(filterOptions.regions || []).map((region) => (
              <option key={region} value={region}>
                {region}
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
            placeholder="Поиск персонажей..."
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>
    </div>
  );
} 