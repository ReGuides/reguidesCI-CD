'use client';

import { Artifact } from '@/types';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import { Modal } from '@/components/ui/modal';

const rarityColors = {
  1: { gradient: 'from-gray-400 to-gray-500', shadow: 'shadow-gray-500/20', badge: 'bg-gray-500/20 text-gray-400' },
  2: { gradient: 'from-green-400 to-green-500', shadow: 'shadow-green-500/20', badge: 'bg-green-500/20 text-green-400' },
  3: { gradient: 'from-blue-400 to-blue-500', shadow: 'shadow-blue-500/20', badge: 'bg-blue-500/20 text-blue-400' },
  4: { gradient: 'from-purple-400 to-purple-500', shadow: 'shadow-purple-500/20', badge: 'bg-purple-500/20 text-purple-400' },
  5: { gradient: 'from-amber-400 to-amber-500', shadow: 'shadow-amber-500/20', badge: 'bg-amber-500/20 text-amber-400' }
};

interface ArtifactModalProps {
  artifact: Artifact | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArtifactModal({ artifact, isOpen, onClose }: ArtifactModalProps) {
  if (!artifact) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="relative w-24 h-24 flex-shrink-0">
          <img
            src={getImageWithFallback(artifact.image, artifact.name, 'artifact')}
            alt={artifact.name}
            className={`w-full h-full object-contain rounded-xl border-2 border-neutral-700 bg-neutral-800 ${rarityColors[artifact.rarity[0] as keyof typeof rarityColors]?.shadow || rarityColors[1].shadow}`}
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/artifacts/default.png';
            }}
          />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={`text-xl font-bold bg-gradient-to-r ${rarityColors[artifact.rarity[0] as keyof typeof rarityColors]?.gradient || rarityColors[1].gradient} bg-clip-text text-transparent`}>{artifact.name}</h2>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${rarityColors[artifact.rarity[0] as keyof typeof rarityColors]?.badge || rarityColors[1].badge}`}>{artifact.rarity[0]}★</span>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-purple-300 mb-1">Бонусы:</div>
            <div className="text-gray-200 text-sm bg-purple-900/10 rounded p-2">
              {(() => {
                return (
                  <>
                    {artifact.bonus1 && <div className="mb-1">1 предмет: {artifact.bonus1}</div>}
                    {artifact.bonus2 && <div className="mb-1">2 предмета: {artifact.bonus2}</div>}
                    {artifact.bonus4 && <div>4 предмета: {artifact.bonus4}</div>}
                    {!artifact.bonus1 && !artifact.bonus2 && !artifact.bonus4 && (
                      <div className="text-gray-400 italic">Бонусы не указаны</div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
} 