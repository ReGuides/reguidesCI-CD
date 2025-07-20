'use client';

import { Weapon } from '@/types';
import { getImageWithFallback, getSafeImageUrl } from '@/lib/utils/imageUtils';
import { Modal } from '@/components/ui/modal';

const rarityColors = {
  5: {
    gradient: 'from-yellow-400 to-amber-500',
    badge: 'bg-yellow-900/30 text-yellow-200',
    shadow: 'drop-shadow-[0_0_16px_rgba(234,179,8,0.4)]',
  },
  4: {
    gradient: 'from-purple-400 to-pink-400',
    badge: 'bg-purple-900/30 text-purple-200',
    shadow: 'drop-shadow-[0_0_16px_rgba(147,51,234,0.4)]',
  },
  3: {
    gradient: 'from-blue-400 to-cyan-400',
    badge: 'bg-blue-900/30 text-blue-200',
    shadow: 'drop-shadow-[0_0_16px_rgba(59,130,246,0.4)]',
  },
  2: {
    gradient: 'from-green-400 to-emerald-400',
    badge: 'bg-green-900/30 text-green-200',
    shadow: 'drop-shadow-[0_0_16px_rgba(34,197,94,0.4)]',
  },
  1: {
    gradient: 'from-gray-400 to-slate-400',
    badge: 'bg-gray-900/30 text-gray-200',
    shadow: 'drop-shadow-[0_0_16px_rgba(107,114,128,0.4)]',
  },
};

interface WeaponModalProps {
  weapon: Weapon | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WeaponModal({ weapon, isOpen, onClose }: WeaponModalProps) {
  if (!weapon) return null;

  const rarity = weapon.rarity;
  const colors = rarityColors[rarity as 1|2|3|4|5] || rarityColors[1];

  const getImageSrc = () => {
    if (!weapon.image) return '/images/weapons/default.png';
    return getSafeImageUrl(weapon.image, weapon.name, 'weapon');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="relative w-24 h-24 flex-shrink-0">
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colors.gradient} opacity-60`} />
          <img
            src={getImageSrc()}
            alt={weapon.name}
            className={`w-full h-full object-contain rounded-xl border-2 border-neutral-700 bg-neutral-800 ${colors.shadow}`}
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/weapons/default.png';
            }}
          />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={`text-xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>{weapon.name}</h2>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors.badge}`}>{rarity}★</span>
            <span className="px-2 py-0.5 rounded text-xs bg-neutral-800 text-neutral-200 font-semibold">{weapon.type}</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="font-semibold text-amber-300 mb-1">Базовый урон</div>
              <div className="text-gray-200 text-sm bg-amber-900/10 rounded p-2">
                {weapon.baseAttack}
              </div>
            </div>
            <div>
              <div className="font-semibold text-amber-300 mb-1">Вторичная характеристика</div>
              <div className="text-gray-200 text-sm bg-amber-900/10 rounded p-2">
                {weapon.subStatName && weapon.subStatValue
                  ? `${weapon.subStatName}: ${weapon.subStatValue}`
                  : '—'}
              </div>
            </div>
            {weapon.passiveEffect && (
              <div>
                <div className="font-semibold text-amber-300 mb-1">Пассивное умение</div>
                <div className="text-gray-200 text-sm bg-amber-900/10 rounded p-2 whitespace-pre-line">{weapon.passiveEffect}</div>
              </div>
            )}
            {weapon.passiveEffect && (
              <div>
                <div className="font-semibold text-amber-300 mb-1">Описание</div>
                <div className="text-gray-300 text-sm bg-amber-900/10 rounded p-2 whitespace-pre-line">{weapon.passiveEffect}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
} 