'use client';

import React, { useState, useEffect } from 'react';
import { Sword, Zap, Shield, HelpCircle, Star } from 'lucide-react';
import { TalentModal } from '@/components/talent-modal';
import { Talent } from '@/types';

interface CharacterTalentsSectionProps {
  characterId: string;
  onItemClick?: (type: string, id: string) => Promise<void>;
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
  burst: Shield,
  passive: Star
};

const TALENT_LABELS = {
  normal: 'Обычная атака',
  skill: 'Элементальный навык',
  burst: 'Взрыв стихии',
  passive: 'Пассивный талант'
};

const TALENT_COLORS = {
  normal: 'text-blue-400',
  skill: 'text-green-400',
  burst: 'text-purple-400',
  passive: 'text-yellow-400'
};

const CharacterTalentsSection: React.FC<CharacterTalentsSectionProps> = ({ 
  characterId,
  onItemClick
}) => {
  const [talentsData, setTalentsData] = useState<CharacterTalents | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);

  const formatTalentName = (talent: string) => {
    const talentNames: { [key: string]: string } = {
      'normal': 'Обычная атака',
      'skill': 'Элементальный навык',
      'burst': 'Взрыв стихии',
      'passive': 'Пассивный талант',
      'auto': 'Обычная атака',
      'e': 'Элементальный навык',
      'q': 'Взрыв стихии',
      'basic': 'Обычная атака',
      'elemental': 'Элементальный навык',
      'ultimate': 'Взрыв стихии'
    };
    return talentNames[talent.toLowerCase()] || talent;
  };

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/talents/character/${characterId}`);
        if (response.ok) {
          const data = await response.json();
          setTalentsData(data);
        }
      } catch (state) {
        console.error('Error fetching talents:', state);
      } finally {
        setLoading(false);
      }
    };

    fetchTalents();
  }, [characterId]);

  const handleTalentClick = async (talent: Talent) => {
    if (onItemClick) {
      // Используем переданный обработчик
      const talentId = talent._id || talent.type;
      await onItemClick('talent', talentId);
    } else {
      // Fallback на локальную модалку
      setSelectedTalent(talent);
      setIsTalentModalOpen(true);
    }
  };

  const closeTalentModal = () => {
    setIsTalentModalOpen(false);
    setSelectedTalent(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {talentsData.talents.map((talent, index) => {
            const Icon = TALENT_ICONS[talent.type] || HelpCircle;
            const label = TALENT_LABELS[talent.type] || 'Неизвестный тип';
            const color = TALENT_COLORS[talent.type] || 'text-blue-400';
            
            return (
              <div 
                key={index} 
                className="bg-card border border-neutral-700 rounded-lg p-4 cursor-pointer hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-200 group"
                onClick={() => handleTalentClick(talent)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className={`w-6 h-6 ${color}`} />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {talent.name}
                    </h4>
                    <p className="text-sm text-gray-400">{label}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                    {talent.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    {talent.cooldown && (
                      <span className="px-2 py-1 bg-neutral-800 rounded text-gray-300">
                        ⏱️ {talent.cooldown}
                      </span>
                    )}
                    {talent.energyCost && (
                      <span className="px-2 py-1 bg-neutral-800 rounded text-gray-300">
                        ⚡ {talent.energyCost}
                      </span>
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
                    <p className="text-white font-medium">{formatTalentName(priority.talentName)}</p>
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

      {/* Модальное окно таланта */}
      <TalentModal
        talent={selectedTalent}
        isOpen={isTalentModalOpen}
        onClose={closeTalentModal}
      />
    </div>
  );
};

export default CharacterTalentsSection; 