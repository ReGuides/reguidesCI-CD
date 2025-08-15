'use client';

import { useState, useCallback } from 'react';
import { Search, SortDesc, Sword } from 'lucide-react';

interface Filters {
  search: string;
  type: string;
  sortBy: 'date' | 'name';
}

interface WeaponFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function WeaponFilters({ filters, onFiltersChange }: WeaponFiltersProps) {
  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, search: value });
  }, [filters, onFiltersChange]);

  const handleTypeChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, type: value });
  }, [filters, onFiltersChange]);

  const handleSortChange = useCallback((value: 'date' | 'name') => {
    onFiltersChange({ ...filters, sortBy: value });
  }, [filters, onFiltersChange]);

  return (
    <div className="mb-8 bg-card rounded-lg shadow-md p-6 border border-neutral-700">
      <div className="flex flex-col gap-4">
        {/* Search by name */}
        <div>
          <label className="block text-sm font-medium text-text mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Поиск по названию
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Введите название оружия..."
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-text mb-2 flex items-center gap-2">
            <Sword className="w-4 h-4" />
            Тип оружия
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">Все типы</option>
            <option value="Sword">Меч</option>
            <option value="Claymore">Двуручное</option>
            <option value="Polearm">Древковое</option>
            <option value="Bow">Лук</option>
            <option value="Catalyst">Катализатор</option>
          </select>
        </div>

        {/* Sort by */}
        <div>
          <label className="block text-sm font-medium text-text mb-2 flex items-center gap-2">
            <SortDesc className="w-4 h-4" />
            Сортировка
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as 'date' | 'name')}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="date">По дате добавления (новые первыми)</option>
            <option value="name">По названию (А-Я)</option>
          </select>
        </div>
      </div>
    </div>
  );
} 