'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArtifactCard } from '@/components/artifact-card';
import { ArtifactFilters } from '@/components/features/artifact-filters';
import { Artifact } from '@/types';
import LoadingSpinner from '@/components/ui/loading-spinner';
import PageTitle from '@/components/ui/page-title';

export default function ArtifactsPage() {
  return (
    <>
      <PageTitle title="Артефакты" />
      <ArtifactsPageContent />
    </>
  );
}

function ArtifactsPageContent() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
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
    const fetchArtifacts = async () => {
      try {
        setLoading(true);
        
        const params = new URLSearchParams();
        if (filters.type !== 'all') params.append('type', filters.type);
        if (filters.rarity !== 'all') params.append('rarity', filters.rarity);
        if (filters.search) params.append('search', filters.search);

        const response = await fetch(`/api/artifacts?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        setArtifacts(data.data || []);
      } catch (err) {
        console.error('Error fetching artifacts:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchArtifacts();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 overflow-hidden">
      <aside className="w-full md:w-64 flex-shrink-0 min-w-0">
        <ArtifactFilters filters={filters} onFiltersChange={handleFiltersChange} />
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
        {/* Artifacts Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {artifacts.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        )}
        {/* No Results */}
        {!loading && !error && artifacts.length === 0 && (
          <div className="text-center text-text-secondary">
            <p>Артефакты не найдены</p>
          </div>
        )}
      </main>
    </div>
  );
} 