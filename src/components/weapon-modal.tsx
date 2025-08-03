'use client';

import { Weapon } from '@/types';
import { getSafeImageUrl } from '@/lib/utils/imageUtils';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface WeaponModalProps {
  weapon: Weapon | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WeaponModal({ weapon, isOpen, onClose }: WeaponModalProps) {
  if (!isOpen || !weapon) return null;

  useEffect(() => {
    console.log('WeaponModal weapon changed:', weapon);
  }, [weapon]);

  console.log('WeaponModal received weapon:', weapon);
  console.log('Weapon fields:', {
    name: weapon.name,
    type: weapon.type,
    rarity: weapon.rarity,
    baseAttack: weapon.baseAttack,
    subStatName: weapon.subStatName,
    subStatValue: weapon.subStatValue,
    passiveName: weapon.passiveName,
    passiveEffect: weapon.passiveEffect,
    image: weapon.image
  });

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
              <h2 className="text-2xl font-bold text-white mb-2">{weapon.name}</h2>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-neutral-800 rounded text-sm text-gray-300">
                  {weapon.type || 'Не указано'}
                </span>
                <div className="flex gap-1">
                  {getRarityStars(Number(weapon.rarity))}
                </div>
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
                src={getSafeImageUrl(weapon.image, weapon.name, 'weapon')}
                alt={weapon.name}
                width={200}
                height={160}
                className="w-52 h-52 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/images/weapons/default.png';
                }}
              />
            </div>

            {/* Информация */}
            <div className="space-y-5">
              <div className="bg-neutral-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Основная информация</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-neutral-700">
                    <span className="text-gray-400">Базовая атака</span>
                    <span className="text-white font-medium">
                      {weapon.baseAttack || 'Не указано'}
                      {weapon.baseAttack === undefined && ' (undefined)'}
                      {weapon.baseAttack === null && ' (null)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-700">
                    <span className="text-gray-400">Дополнительная характеристика</span>
                    <span className="text-white font-medium">
                      {weapon.subStatName || 'Не указано'}
                      {weapon.subStatName === undefined && ' (undefined)'}
                      {weapon.subStatName === null && ' (null)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Значение</span>
                    <span className="text-white font-medium">
                      {weapon.subStatValue || 'Не указано'}
                      {weapon.subStatValue === undefined && ' (undefined)'}
                      {weapon.subStatValue === null && ' (null)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Пассивное умение</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs">Название</span>
                    <p className="text-white font-medium mt-1">
                      {weapon.passiveName || 'Не указано'}
                      {weapon.passiveName === undefined && ' (undefined)'}
                      {weapon.passiveName === null && ' (null)'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Эффект</span>
                    <p className="text-white mt-2 text-sm leading-relaxed bg-neutral-900 rounded p-3">
                      {weapon.passiveEffect || 'Не указано'}
                      {weapon.passiveEffect === undefined && ' (undefined)'}
                      {weapon.passiveEffect === null && ' (null)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 