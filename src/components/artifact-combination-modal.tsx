'use client';

import React from 'react';
import { X } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import { ArtifactOrCombination } from '@/types';

interface ArtifactCombinationModalProps {
  combination: ArtifactOrCombination | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArtifactCombinationModal({ combination, isOpen, onClose }: ArtifactCombinationModalProps) {
  // Type guard для проверки, что это ArtifactCombination с sets
  const isArtifactCombination = (item: ArtifactOrCombination | null): item is ArtifactOrCombination & { sets: unknown[] } => {
    return item !== null && 
           'setType' in item && 
           item.setType === 'combination' && 
           'sets' in item && 
           Array.isArray(item.sets) && 
           item.sets.length >= 2;
  };

  if (!isOpen || !isArtifactCombination(combination)) {
    return null;
  }

  const [set1, set2] = combination.sets;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <h2 className="text-2xl font-bold text-white">Комбинация артефактов 2+2</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Первый сет */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 flex-shrink-0">
                  <OptimizedImage
                    src={getImageWithFallback(set1.image, set1.name, 'artifact')}
                    alt={set1.name}
                    className="w-full h-full rounded object-cover"
                    type="artifact"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{set1.name}</h3>
                  <p className="text-gray-400 text-sm">2 предмета</p>
                </div>
              </div>
              
              {set1.twoPieceBonus && (
                <div className="bg-neutral-700 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">Бонус за 2 предмета:</h4>
                  <p className="text-white text-sm leading-relaxed">{set1.twoPieceBonus}</p>
                </div>
              )}
            </div>

            {/* Второй сет */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 flex-shrink-0">
                  <OptimizedImage
                    src={getImageWithFallback(set2.image, set2.name, 'artifact')}
                    alt={set2.name}
                    className="w-full h-full rounded object-cover"
                    type="artifact"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{set2.name}</h3>
                  <p className="text-gray-400 text-sm">2 предмета</p>
                </div>
              </div>
              
              {set2.twoPieceBonus && (
                <div className="bg-neutral-700 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">Бонус за 2 предмета:</h4>
                  <p className="text-white text-sm leading-relaxed">{set2.twoPieceBonus}</p>
                </div>
              )}
            </div>
          </div>

          {/* Общая информация о комбинации */}
          <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <h4 className="text-blue-300 font-medium mb-1">О комбинации 2+2</h4>
                <p className="text-blue-200 text-sm">
                  Эта комбинация дает бонусы от двух разных сетов артефактов. 
                  Каждый сет активирует свой бонус за 2 предмета, что может быть 
                  более эффективно, чем полный бонус одного сета.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
