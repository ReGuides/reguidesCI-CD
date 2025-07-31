'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface CharacterConstellationsSectionProps {
  characterId: string;
}

interface Constellation {
  name: string;
  level: number;
  description: string;
  effect?: string;
  priority?: number;
}

interface CharacterConstellations {
  characterId: string;
  constellations: Constellation[];
  priorities: {
    constellationName: string;
    priority: number;
    description?: string;
  }[];
  notes?: string;
}

const CharacterConstellationsSection: React.FC<CharacterConstellationsSectionProps> = ({ characterId }) => {
  const [constellationsData, setConstellationsData] = useState<CharacterConstellations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConstellations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/characters/${characterId}/constellations`);
        if (response.ok) {
          const data = await response.json();
          setConstellationsData(data);
        }
      } catch (error) {
        console.error('Error fetching constellations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConstellations();
  }, [characterId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-neutral-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!constellationsData || constellationsData.constellations.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <Star className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-lg font-semibold mb-2">Информация о созвездиях</h3>
        <p>Созвездия для этого персонажа пока не настроены</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Созвездия */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Созвездия персонажа</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {constellationsData.constellations
            .sort((a, b) => a.level - b.level)
            .map((constellation, index) => (
              <div key={index} className="bg-card border border-neutral-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-full">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{constellation.name}</h4>
                    <p className="text-sm text-purple-400">C{constellation.level}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-300 leading-relaxed">{constellation.description}</p>
                  
                  {constellation.effect && (
                    <div className="bg-neutral-800 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-gray-300 mb-1">Эффект</h5>
                      <p className="text-sm text-gray-400">{constellation.effect}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Приоритеты созвездий */}
      {constellationsData.priorities && constellationsData.priorities.length > 0 && (
        <div className="bg-card border border-neutral-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Приоритеты созвездий</h3>
          <div className="space-y-3">
            {constellationsData.priorities
              .sort((a, b) => a.priority - b.priority)
              .map((priority, index) => (
                <div key={index} className="flex items-center gap-3 bg-neutral-800 rounded-lg p-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-full text-white font-bold text-sm">
                    {priority.priority}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{priority.constellationName}</p>
                    {priority.description && (
                      <p className="text-sm text-gray-400">{priority.description}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Заметки */}
      {constellationsData.notes && (
        <div className="bg-card border border-neutral-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-white">Заметки по созвездиям</h3>
          <p className="text-gray-400 whitespace-pre-line">{constellationsData.notes}</p>
        </div>
      )}
    </div>
  );
};

export default CharacterConstellationsSection; 