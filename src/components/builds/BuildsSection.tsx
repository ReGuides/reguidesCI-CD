'use client';

import React, { useState, useEffect } from 'react';
import BuildCard from './BuildCard';
import { BookOpen, Loader2 } from 'lucide-react';

interface BuildsSectionProps {
  characterId: string;
}

interface Build {
  _id: string;
  title: string;
  description?: string;
  role: string;
  weapons: string[];
  artifacts: Array<{
    setType: 'single' | 'combination';
    id?: string;
    name?: string;
    image?: string;
    rarity?: number[];
  }>;
  mainStats: string[];
  subStats: string[];
  talentPriorities: string[];
  isFeatured?: boolean;
}

const BuildsSection: React.FC<BuildsSectionProps> = ({ characterId }) => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/builds/character/${characterId}`);
        if (response.ok) {
          const data = await response.json();
          setBuilds(data);
        } else {
          setError('Не удалось загрузить билды');
        }
      } catch (error) {
        console.error('Error fetching builds:', error);
        setError('Ошибка при загрузке билдов');
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, [characterId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <BookOpen className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ошибка загрузки</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (builds.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-500" />
        <h3 className="text-lg font-semibold mb-2 text-gray-300">Билды не найдены</h3>
        <p className="text-gray-400">Для этого персонажа пока нет готовых билдов</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Готовые билды ({builds.length})</h2>
      </div>
      
      <div className="grid gap-6">
        {builds.map((build) => (
          <BuildCard key={build._id} build={build} />
        ))}
      </div>
    </div>
  );
};

export default BuildsSection; 