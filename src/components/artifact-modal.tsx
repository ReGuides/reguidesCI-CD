'use client';

import { Artifact } from '@/types';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ArtifactModalProps {
  artifact: Artifact | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArtifactModal({ artifact, isOpen, onClose }: ArtifactModalProps) {
  if (!isOpen || !artifact) return null;

  const getRarityStars = (rarity: number) => {
    return Array.from({ length: rarity }, (_, i) => (
      <span key={i} className="text-yellow-400">★</span>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-neutral-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-neutral-700" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{artifact.name}</h2>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {Array.isArray(artifact.rarity) 
                    ? artifact.rarity.map((rarity, index) => (
                        <span key={index} className="text-yellow-400">★</span>
                      ))
                    : getRarityStars(artifact.rarity)
                  }
                </div>
                <span className="px-2 py-1 bg-neutral-800 rounded text-sm text-gray-300">
                  {artifact.pieces} частей
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Изображение */}
            <div className="flex justify-center">
              <Image
                src={getImageWithFallback(artifact.image, artifact.name, 'artifact')}
                alt={artifact.name}
                width={200}
                height={160}
                className="w-52 h-52 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/images/artifacts/default.png';
                }}
              />
            </div>

            {/* Информация */}
            <div className="space-y-4">
              <div className="bg-neutral-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Бонусы сета</h3>
                <div className="space-y-4 text-sm">
                  {artifact.bonus2 && (
                    <div className="bg-neutral-900 rounded p-3 border border-neutral-600">
                      <div className="text-blue-300 text-xs mb-2">2 предмета</div>
                      <p className="text-white leading-relaxed">
                        {artifact.bonus2}
                      </p>
                    </div>
                  )}
                  {artifact.bonus4 && (
                    <div className="bg-neutral-900 rounded p-3 border border-neutral-600">
                      <div className="text-purple-300 text-xs mb-2">4 предмета</div>
                      <p className="text-white leading-relaxed">
                        {artifact.bonus4}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 