import { Weapon } from '@/types';
import { getSafeImageUrl } from '@/lib/utils/imageUtils';
import Image from 'next/image';
import { useState } from 'react';
import { WeaponModal } from './weapon-modal';

interface WeaponCardProps {
  weapon: Weapon;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function WeaponCard({ weapon, onSelect, isSelected }: WeaponCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullWeapon, setFullWeapon] = useState<Weapon | null>(null);
  const [loadingWeapon, setLoadingWeapon] = useState(false);

  const handleCardClick = async () => {
    if (onSelect) {
      onSelect();
    } else {
      setIsModalOpen(true);
      await loadFullWeapon();
    }
  };

  const loadFullWeapon = async () => {
    if (fullWeapon) return; // Уже загружено
    
    try {
      setLoadingWeapon(true);
      const response = await fetch(`/api/weapons/${weapon.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const weaponData = await response.json();
      // Исправляем извлечение данных из ответа API
      const weaponInfo = weaponData.data || weaponData;
      setFullWeapon(weaponInfo);
    } catch (err) {
      console.error('Error loading full weapon data:', err);
      // Используем базовые данные если загрузка не удалась
      setFullWeapon(weapon);
    } finally {
      setLoadingWeapon(false);
    }
  };

  // Функция для определения цветов в зависимости от редкости
  const getRarityColors = (rarity: number) => {
    switch (rarity) {
      case 5:
        return {
          gradient: 'from-yellow-500/5 to-amber-500/5',
          border: 'border-yellow-500/50 group-hover:border-yellow-400/70',
          glow: 'from-yellow-500/0 via-yellow-500/50 to-yellow-500/0 group-hover:from-yellow-400/0 group-hover:via-yellow-400/70 group-hover:to-yellow-400/0',
          text: 'from-yellow-400 to-amber-400',
          shadow: 'rgba(234,179,8,0.3)',
          shadowHover: 'rgba(234,179,8,0.5)',
          type: 'text-yellow-200/80 group-hover:text-yellow-200',
          subStat: 'from-yellow-300 to-amber-300',
          imageGlow: 'from-yellow-500/10'
        };
      case 4:
        return {
          gradient: 'from-purple-500/5 to-pink-500/5',
          border: 'border-purple-500/50 group-hover:border-purple-400/70',
          glow: 'from-purple-500/0 via-purple-500/50 to-purple-500/0 group-hover:from-purple-400/0 group-hover:via-purple-400/70 group-hover:to-purple-400/0',
          text: 'from-purple-400 to-pink-400',
          shadow: 'rgba(147,51,234,0.3)',
          shadowHover: 'rgba(147,51,234,0.5)',
          type: 'text-purple-200/80 group-hover:text-purple-200',
          subStat: 'from-purple-300 to-pink-300',
          imageGlow: 'from-purple-500/10'
        };
      case 3:
        return {
          gradient: 'from-blue-500/5 to-cyan-500/5',
          border: 'border-blue-500/50 group-hover:border-blue-400/70',
          glow: 'from-blue-500/0 via-blue-500/50 to-blue-500/0 group-hover:from-blue-400/0 group-hover:via-blue-400/70 group-hover:to-blue-400/0',
          text: 'from-blue-400 to-cyan-400',
          shadow: 'rgba(59,130,246,0.3)',
          shadowHover: 'rgba(59,130,246,0.5)',
          type: 'text-blue-200/80 group-hover:text-blue-200',
          subStat: 'from-blue-300 to-cyan-300',
          imageGlow: 'from-blue-500/10'
        };
      case 2:
        return {
          gradient: 'from-green-500/5 to-emerald-500/5',
          border: 'border-green-500/50 group-hover:border-green-400/70',
          glow: 'from-green-500/0 via-green-500/50 to-green-500/0 group-hover:from-green-400/0 group-hover:via-green-400/70 group-hover:to-green-400/0',
          text: 'from-green-400 to-emerald-400',
          shadow: 'rgba(34,197,94,0.3)',
          shadowHover: 'rgba(34,197,94,0.5)',
          type: 'text-green-200/80 group-hover:text-green-200',
          subStat: 'from-green-300 to-emerald-300',
          imageGlow: 'from-green-500/10'
        };
      default:
        return {
          gradient: 'from-gray-500/5 to-slate-500/5',
          border: 'border-gray-500/50 group-hover:border-gray-400/70',
          glow: 'from-gray-500/0 via-gray-500/50 to-gray-500/0 group-hover:from-gray-400/0 group-hover:via-gray-400/70 group-hover:to-gray-400/0',
          text: 'from-gray-400 to-slate-400',
          shadow: 'rgba(107,114,128,0.3)',
          shadowHover: 'rgba(107,114,128,0.5)',
          type: 'text-gray-200/80 group-hover:text-gray-200',
          subStat: 'from-gray-300 to-slate-300',
          imageGlow: 'from-gray-500/10'
        };
    }
  };

  const colors = getRarityColors(Number(weapon.rarity));

  const getImageSrc = () => {
    if (!weapon.image) return '/images/weapons/default.png';
    return getSafeImageUrl(weapon.image, weapon.name, 'weapon');
  };

  return (
    <>
      <div 
        className={`group relative bg-neutral-900 rounded p-2 w-40 shadow-lg hover:scale-105 transition-all duration-500 ${isSelected ? 'ring-2 ring-accent' : ''} cursor-pointer`}
        onClick={handleCardClick}
      >
      <div className={`absolute inset-0 rounded bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className={`absolute inset-0 rounded border-t-2 ${colors.border} transition-colors duration-500`} />
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.glow} transition-all duration-500`} />
      <div className="relative">
        <div className="relative">
          <Image 
            src={getImageSrc()}
            alt={weapon.name} 
            width={160}
            height={128}
            className={`w-full h-32 object-contain mb-1.5 filter drop-shadow-[0_0_8px_${colors.shadow}] group-hover:drop-shadow-[0_0_15px_${colors.shadowHover}] transition-all duration-500`}
            onError={(e) => {
              console.error('Image load error:', weapon.image);
              e.currentTarget.src = '/images/weapons/default.png';
            }}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${colors.imageGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </div>
        <div className="font-semibold text-white text-base mb-1 drop-shadow-[0_0_8px_${colors.shadow}] group-hover:drop-shadow-[0_0_12px_${colors.shadowHover}] transition-all duration-500">
          {weapon.name}
        </div>
        <div className="flex gap-0.5 mb-1">
          {Array.from({ length: Number(weapon.rarity) }).map((_, i) => (
            <span key={i} className="text-yellow-300 text-base drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(234,179,8,0.7)] transition-all duration-500">★</span>
          ))}
        </div>
        <div className={`text-sm ${colors.type} mb-1 transition-colors duration-500`}>
          {weapon.type}
        </div>
        <div className={`text-sm text-transparent bg-clip-text bg-gradient-to-r ${colors.subStat}`}>
          {weapon.subStatName}
        </div>
      </div>
    </div>
      <WeaponModal 
        weapon={fullWeapon || weapon}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={loadingWeapon}
      />
    </>
  );
} 