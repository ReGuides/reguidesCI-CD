'use client';

import React, { useState, useEffect } from 'react';
import { Sword, Zap, Shield } from 'lucide-react';

interface CharacterTalentsSectionProps {
  characterId: string;
}

interface Talent {
  name: string;
  type: 'normal' | 'skill' | 'burst';
  description: string;
  cooldown?: string;
  energyCost?: number;
  priority?: number;
}

interface CharacterTalents {
  characterId: string;
  talents: Talent[];
  priorities: {
    talentName: string;
    priority: number;
    description?: string;
  }[];
  notes?: string;
}

const TALENT_ICONS = {
  normal: Sword,
  skill: Zap,
  burst: Shield
};

const TALENT_LABELS = {
  normal: 'Обычная атака',
  skill: 'Элементальный навык',
  burst: 'Взрыв стихии'
};

const CharacterTalentsSection: React.FC<CharacterTalentsSectionProps> = ({ characterId }) => {
  const [talentsData, setTalentsData] = useState<CharacterTalents | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/characters/${characterId}/talents`);
        if (response.ok) {
          const data = await response.json();
          setTalentsData(data);
        }
      } catch (error) {
        console.error('Error fetching talents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTalents();
  }, [characterId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-700 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-neutral-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!talentsData || talentsData.talents.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <Sword className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-lg font-semibold mb-2">Информация о талантах</h3>
        <p>Таланты для этого персонажа пока не настроены</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Таланты */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Таланты персонажа</h3>
        <div className="space-y-4">
          {talentsData.talents.map((talent, index) => {
            const Icon = TALENT_ICONS[talent.type];
            const label = TALENT_LABELS[talent.type];
            
            return (
              <div key={index} className="bg-card border border-neutral-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-6 h-6 text-blue-400" />
                  <div>
                    <h4 className="text-lg font-semibold text-white">{talent.name}</h4>
                    <p className="text-sm text-gray-400">{label}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-300 leading-relaxed">{talent.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    {talent.cooldown && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Перезарядка:</span>
                        <span className="text-white">{talent.cooldown}</span>
                      </div>
                    )}
                    {talent.energyCost && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Энергия:</span>
                        <span className="text-white">{talent.energyCost}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Приоритеты прокачки */}
      {talentsData.priorities && talentsData.priorities.length > 0 && (
        <div className="bg-card border border-neutral-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Приоритеты прокачки</h3>
          <div className="space-y-3">
            {talentsData.priorities
              .sort((a, b) => a.priority - b.priority)
              .map((priority, index) => (
                <div key={index} className="flex items-center gap-3 bg-neutral-800 rounded-lg p-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white font-bold text-sm">
                    {priority.priority}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{priority.talentName}</p>
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
      {talentsData.notes && (
        <div className="bg-card border border-neutral-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-white">Заметки по талантам</h3>
          <p className="text-gray-400 whitespace-pre-line">{talentsData.notes}</p>
        </div>
      )}
    </div>
  );
};

export default CharacterTalentsSection; 