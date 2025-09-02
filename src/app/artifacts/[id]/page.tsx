'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Artifact } from '@/types';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import LoadingSpinner from '@/components/ui/loading-spinner';
import PageTitle from '@/components/ui/page-title';

export default function ArtifactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Устанавливаем заголовок страницы
  useEffect(() => {
    if (artifact) {
      document.title = `${artifact.name} - ReGuides`;
    }
  }, [artifact]);

  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/artifacts/${id}`);
        if (!response.ok) {
          throw new Error('Artifact not found');
        }
        
        const data = await response.json();
        setArtifact(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchArtifact();
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/artifacts" className="text-blue-600 hover:underline">
          ← Back to Artifacts
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" className="text-blue-600" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      )}

      {/* Artifact Content */}
      {!loading && !error && artifact && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Artifact Image */}
            <div className="md:w-1/3">
              <div className="relative">
                <img
                  src={getImageWithFallback(artifact.image, artifact.name, 'artifact')}
                  alt={artifact.name}
                  className="w-full h-96 md:h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/artifacts/default.png';
                  }}
                />
                {artifact.rarity && artifact.rarity.length > 0 && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                    {Math.max(...artifact.rarity)}★
                  </div>
                )}
              </div>
            </div>

            {/* Artifact Info */}
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold mb-4">{artifact.name}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                  <div className="space-y-3">
                    {artifact.rarity && artifact.rarity.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">Rarity:</span>
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                          {artifact.rarity.join('/')}★
                        </span>
                      </div>
                    )}
                    {artifact.pieces && (
                      <div>
                        <span className="font-medium text-gray-700">Pieces:</span>
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {artifact.pieces}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Set Bonuses */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Set Bonuses</h2>
                  <div className="space-y-4">
                    {artifact.bonus2 && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">2-Piece Bonus:</h3>
                        <p className="text-gray-700 leading-relaxed">{artifact.bonus2}</p>
                      </div>
                    )}
                    {artifact.bonus4 && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">4-Piece Bonus:</h3>
                        <p className="text-gray-700 leading-relaxed">{artifact.bonus4}</p>
                      </div>
                    )}
                    {artifact.bonus1 && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">1-Piece Bonus:</h3>
                        <p className="text-gray-700 leading-relaxed">{artifact.bonus1}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Not Found State */}
      {!loading && !error && !artifact && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Artifact not found</h2>
        </div>
      )}
    </div>
  );
} 