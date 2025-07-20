'use client';

import { useState, useEffect } from 'react';
import { Artifact } from '@/types';
import { Card } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { IconActionButton } from '@/components/ui/icon-action-button';
import { AddButton } from '@/components/ui/add-button';
import { Input } from '@/components/ui/input';
import OptimizedImage from '@/components/ui/optimized-image';
import { Eye, Pencil, Trash, Plus } from 'lucide-react';
import { getImageWithFallback } from '@/lib/utils/imageUtils';

export default function ArtifactsAdminPage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');

  useEffect(() => {
    fetchArtifacts();
  }, []);

  const fetchArtifacts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/artifacts');
      if (response.ok) {
        const data = await response.json();
        // Гарантируем, что всегда массив
        setArtifacts(Array.isArray(data.data) ? data.data : data.data?.artifacts || data.artifacts || data || []);
      }
    } catch (error) {
      console.error('Error fetching artifacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = artifact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = filterRarity === 'all' || artifact.rarity.includes(Number(filterRarity));
    return matchesSearch && matchesRarity;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Управление артефактами</h1>
        <AddButton 
          variant="primary"
          size="lg"
          icon={<Plus />}
          iconPosition="left"
        >
          Добавить артефакт
        </AddButton>
      </div>

      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Input
            placeholder="Поиск артефактов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white"
          />
        </div>
        <div>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white"
          >
            <option value="all">Все редкости</option>
            <option value="5">5★</option>
            <option value="4">4★</option>
            <option value="3">3★</option>
          </select>
        </div>
        <div className="text-white">
          Всего: {filteredArtifacts.length}
        </div>
      </div>

      {/* Список артефактов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredArtifacts.map((artifact) => (
          <Card key={artifact.id} className="bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors rounded-xl min-h-[240px] flex flex-col justify-between p-4">
            <div className="flex items-start space-x-3 mb-2">
              <div className="relative">
                <OptimizedImage
                  src={getImageWithFallback(artifact.image, artifact.name, 'artifact')}
                  alt={artifact.name}
                  className="w-12 h-12 rounded object-cover border border-neutral-700"
                  type="artifact"
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base text-white mb-1 line-clamp-1">{artifact.name}</div>
                <div className="text-xs text-neutral-400 mb-1">{artifact.pieces} предмета</div>
                <div className="text-xs text-neutral-400 line-clamp-2">{artifact.bonus1}</div>
              </div>
            </div>
            {/* Кнопки действий */}
            <div className="mt-2 pt-2 border-t border-neutral-700 flex gap-2 justify-end">
              <IconActionButton 
                variant="view" 
                icon={<Eye />} 
                title="Просмотр"
              />
              <IconActionButton 
                variant="edit" 
                icon={<Pencil />} 
                title="Редактировать"
              />
              <IconActionButton 
                variant="delete" 
                icon={<Trash />} 
                title="Удалить"
              />
            </div>
          </Card>
        ))}
      </div>

      {filteredArtifacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Артефакты не найдены</p>
        </div>
      )}
    </div>
  );
} 