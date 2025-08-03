'use client';

import React from 'react';
import { X, Sword, Zap, Shield, Star } from 'lucide-react';

interface Talent {
  _id?: string;
  name: string;
  type: 'normal' | 'skill' | 'burst' | 'passive';
  description: string;
  cooldown?: string;
  energyCost?: number;
  priority?: number;
  scaling?: {
    [key: string]: {
      [level: string]: string;
    };
  };
}

interface TalentModalProps {
  talent: Talent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TalentModal({ talent, isOpen, onClose }: TalentModalProps) {
  if (!isOpen || !talent) return null;

  const getTalentIcon = (type: string) => {
    switch (type) {
      case 'normal':
        return <Sword className="w-6 h-6 text-blue-400" />;
      case 'skill':
        return <Zap className="w-6 h-6 text-green-400" />;
      case 'burst':
        return <Shield className="w-6 h-6 text-purple-400" />;
      case 'passive':
        return <Star className="w-6 h-6 text-yellow-400" />;
      default:
        return <Sword className="w-6 h-6 text-blue-400" />;
    }
  };

  const getTalentLabel = (type: string) => {
    switch (type) {
      case 'normal':
        return 'Обычная атака';
      case 'skill':
        return 'Элементальный навык';
      case 'burst':
        return 'Взрыв стихии';
      case 'passive':
        return 'Пассивный талант';
      default:
        return 'Талант';
    }
  };

  const getTalentColor = (type: string) => {
    switch (type) {
      case 'normal':
        return 'text-blue-400';
      case 'skill':
        return 'text-green-400';
      case 'burst':
        return 'text-purple-400';
      case 'passive':
        return 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-neutral-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-neutral-700" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              {getTalentIcon(talent.type)}
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{talent.name}</h2>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getTalentColor(talent.type)} bg-neutral-800`}>
                  {getTalentLabel(talent.type)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-neutral-800 rounded"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Описание */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Описание</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {talent.description}
              </p>
            </div>

            {/* Характеристики */}
            {(talent.cooldown || talent.energyCost) && (
              <div className="bg-neutral-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Характеристики</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {talent.cooldown && (
                    <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                      <span className="text-gray-400">Перезарядка</span>
                      <span className="text-white font-medium">{talent.cooldown}</span>
                    </div>
                  )}
                  {talent.energyCost && (
                    <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                      <span className="text-gray-400">Энергия</span>
                      <span className="text-white font-medium">{talent.energyCost}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Масштабирование */}
            {talent.scaling && Object.entries(talent.scaling).length > 0 && (
              <div className="bg-neutral-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Масштабирование</h3>
                <div className="space-y-4">
                  {Object.entries(talent.scaling).map(([param, levels]) => (
                    <div key={param} className="bg-neutral-900 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-400 mb-3">{param}</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-neutral-700">
                              <th className="text-left py-2 px-3 text-gray-400 font-medium">Уровень</th>
                              <th className="text-right py-2 px-3 text-gray-400 font-medium">Значение</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(levels)
                              .sort(([a], [b]) => parseInt(a) - parseInt(b))
                              .map(([level, value]) => (
                                <tr key={level} className="border-b border-neutral-800/50 hover:bg-neutral-800/50">
                                  <td className="py-2 px-3 text-gray-300 font-medium">
                                    {level}
                                  </td>
                                  <td className="py-2 px-3 text-white text-right">
                                    {value}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 