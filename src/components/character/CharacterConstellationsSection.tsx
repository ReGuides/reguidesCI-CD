'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { ConstellationModal } from '@/components/constellation-modal';

interface CharacterConstellationsSectionProps {
  characterId: string;
}

interface Constellation {
  name: string;
  level: number;
  description: string;
  effect?: string;
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
  const [selectedConstellation, setSelectedConstellation] = useState<Constellation | null>(null);
  const [isConstellationModalOpen, setIsConstellationModalOpen] = useState(false);

  useEffect(() => {
    const fetchConstellations = async () => {
      try {
        setLoading(true);
        console.log('Fetching constellations for character:', characterId);
        const response = await fetch(`/api/characters/${characterId}/constellations`);
        if (response.ok) {
          const data = await response.json();
          console.log('Constellations data received:', data);
          setConstellationsData(data);
        } else {
          console.error('Failed to fetch constellations:', response.status);
        }
      } catch (error) {
        console.error('Error fetching constellations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConstellations();
  }, [characterId]);

  const handleConstellationClick = (constellation: Constellation) => {
    setSelectedConstellation(constellation);
    setIsConstellationModalOpen(true);
  };

  const closeConstellationModal = () => {
    setIsConstellationModalOpen(false);
    setSelectedConstellation(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-neutral-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering constellations section:', {
    hasData: !!constellationsData,
    constellationsCount: constellationsData?.constellations?.length || 0,
    constellations: constellationsData?.constellations
  });

  if (!constellationsData || constellationsData.constellations.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <Star className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-lg font-semibold mb-2">Информация о созвездиях</h3>
        <p>Созвездия для этого персонажа пока не настроены</p>
        <p className="text-sm mt-2">Debug: characterId = {characterId}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Созвездия */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Созвездия персонажа</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {constellationsData.constellations
            .sort((a, b) => a.level - b.level)
            .map((constellation, index) => (
              <div 
                key={index} 
                className="bg-card border border-neutral-700 rounded-lg p-4 cursor-pointer hover:border-purple-600 hover:bg-neutral-800 transition-all duration-200 group"
                onClick={() => handleConstellationClick(constellation)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-full group-hover:bg-purple-500 transition-colors">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                      {constellation.name}
                    </h4>
                    <p className="text-sm text-purple-400">C{constellation.level}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                    {constellation.description}
                  </p>
                  
                  {constellation.effect && (
                    <div className="bg-purple-900/20 border border-purple-700/30 rounded p-2">
                      <p className="text-xs text-purple-300 line-clamp-2">
                        {constellation.effect}
                      </p>
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

      {/* Модальное окно созвездия */}
      <ConstellationModal
        constellation={selectedConstellation}
        isOpen={isConstellationModalOpen}
        onClose={closeConstellationModal}
      />
    </div>
  );
};

export default CharacterConstellationsSection; 