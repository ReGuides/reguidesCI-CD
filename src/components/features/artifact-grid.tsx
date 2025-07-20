'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { Artifact } from '@/types';
import OptimizedImage from '@/components/ui/optimized-image';
import { getImageWithFallback } from '@/lib/utils/imageUtils';

export function ArtifactGrid() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArtifacts();
  }, []);

  const fetchArtifacts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/artifacts');
      const data = await response.json();
      
      if (data.success) {
        setArtifacts(data.data);
      } else {
        setError(data.error || 'Failed to fetch artifacts');
      }
    } catch (err) {
      setError('Failed to fetch artifacts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-48 bg-muted rounded-md mb-4"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchArtifacts}>Попробовать снова</Button>
      </div>
    );
  }

  if (artifacts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Артефакты не найдены</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {artifacts.map((artifact) => (
        <Link key={artifact.id} href={`/artifacts/${artifact.id}`}>
          <Card className="group flex flex-col min-h-[220px] h-full border border-neutral-700 bg-neutral-800/80 rounded-xl shadow-sm hover:shadow-xl hover:border-purple-600 transition-all duration-150 cursor-pointer overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative w-full h-36 bg-neutral-900 flex items-center justify-center overflow-hidden">
                <OptimizedImage
                  src={getImageWithFallback(artifact.image, artifact.name, 'artifact')}
                  alt={artifact.name}
                  className="w-full h-full object-cover object-top"
                />
                {artifact.rarity && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-yellow-300 px-2 py-1 rounded shadow">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-xs font-bold">{Array.isArray(artifact.rarity) ? artifact.rarity.join(' / ') : artifact.rarity}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between p-3 gap-2">
              <div>
                <CardTitle className="text-base font-semibold mb-1 line-clamp-1 text-white group-hover:text-purple-400 transition-colors">{artifact.name}</CardTitle>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                  {artifact.pieces && <span>{artifact.pieces} шт.</span>}
                </div>
                {artifact.bonus1 && (
                  <p className="text-xs text-neutral-400 line-clamp-2 min-h-[32px]">{artifact.bonus1}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
} 