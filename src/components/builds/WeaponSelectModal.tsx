import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OptimizedImage from '@/components/ui/optimized-image';
import { Weapon } from '@/types';
import { getSafeImageUrl } from '@/lib/utils/imageUtils';
import { selectedItemStyles } from '@/lib/utils/selectionStyles';

interface WeaponSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selected: string[]) => void;
  selectedWeapons: string[];
  weapons: Weapon[];
  weaponType?: string; // новый проп
}

export const WeaponSelectModal: React.FC<WeaponSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedWeapons,
  weapons,
  weaponType,
}) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedWeapons);

  useEffect(() => {
    setSelected(selectedWeapons);
  }, [selectedWeapons, isOpen]);

  const normalize = (s: string) => (s || '').toLowerCase().replace(/ё/g, 'е').trim();
  
  const weaponTypeRusVariants: Record<string, string[]> = {
    'лук': ['лук', 'стрелковое'],
    'меч': ['одноручный меч', 'меч'],
    'двуручный меч': ['двуручный меч'],
    'копье': ['копье', 'копьё', 'древковое'],
    'катализатор': ['катализатор'],
  };



  const normWeaponType = normalize(weaponType || '');
  const typeVariants = weaponTypeRusVariants[normWeaponType] || [];
  const filteredWeapons =
    !normWeaponType || typeVariants.length === 0
      ? []
      : weapons.filter(w =>
          typeVariants.includes(normalize(w.type)) &&
          w.name.toLowerCase().includes(search.toLowerCase())
        );

  const handleToggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onSelect(selected);
    onClose();
  };

  const handleReset = () => {
    setSelected([]);
  };

  const getWeaponImage = (weapon: Weapon) => getSafeImageUrl(weapon.image, weapon.name, 'weapon');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-4xl shadow-2xl border border-neutral-700 relative">
        <h2 className="text-xl font-bold mb-4 text-white">Выбрать оружие</h2>
        <Input
          placeholder="Поиск оружия..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-4 bg-neutral-800 border-neutral-700 text-white"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 max-h-[32rem] overflow-y-auto mb-4">
          {filteredWeapons.map(weapon => {
            const selectedIdx = selected.indexOf(weapon.id);
            const isSelected = selectedIdx !== -1;
            return (
              <button
                key={weapon.id}
                type="button"
                onClick={() => handleToggle(weapon.id)}
                className={`relative flex flex-col items-center p-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isSelected
                    ? selectedItemStyles.container
                    : selectedItemStyles.unselected
                }`}
              >
                <OptimizedImage
                  src={getWeaponImage(weapon)}
                  alt={weapon.name}
                  className="w-14 h-14 mb-2 object-contain"
                  type="weapon"
                  fallbackSrc="/images/weapons/default.png"
                />
                <span className="text-sm text-center font-medium line-clamp-2">{weapon.name}</span>
                <span className="text-xs text-neutral-400 mt-1">{weapon.type}</span>
                {isSelected && (
                  <span className="absolute top-2 left-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow">
                    {selectedIdx + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between mt-6 gap-2">
          <Button type="button" variant="outline" onClick={handleReset}>
            Сбросить
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Закрыть
            </Button>
            <Button type="button" variant="default" onClick={handleApply}>
              Выбрать
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 