'use client';

import { useState, useEffect } from 'react';
import { Weapon } from '@/types';
import { Card } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { IconActionButton } from '@/components/ui/icon-action-button';
import { AddButton } from '@/components/ui/add-button';
import { Input } from '@/components/ui/input';
import OptimizedImage from '@/components/ui/optimized-image';
import { Eye, Pencil, Trash, Plus, X } from 'lucide-react';
import { getSafeImageUrl } from '@/lib/utils/imageUtils';
import Link from 'next/link';
import Image from 'next/image';

export default function WeaponsAdminPage() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchWeapons();
  }, []);

  const fetchWeapons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/weapons');
      if (response.ok) {
        const data = await response.json();
        // Гарантируем, что всегда массив
        const weaponsData = data.data || data.weapons || data || [];
        setWeapons(Array.isArray(weaponsData) ? weaponsData : []);
      }
    } catch (error) {
      console.error('Error fetching weapons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWeapons = weapons.filter(weapon => {
    const matchesSearch = weapon.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = filterRarity === 'all' || weapon.rarity.toString() === filterRarity;
    const matchesType = filterType === 'all' || weapon.type === filterType;
    return matchesSearch && matchesRarity && matchesType;
  });

  const openWeaponModal = (weapon: Weapon) => {
    setSelectedWeapon(weapon);
    setShowModal(true);
  };

  const closeWeaponModal = () => {
    setShowModal(false);
    setSelectedWeapon(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Управление оружием</h1>
        <Link href="/admin/weapons/add">
          <AddButton 
            variant="primary"
            size="lg"
            icon={<Plus />}
            iconPosition="left"
          >
            Добавить оружие
          </AddButton>
        </Link>
      </div>

      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Input
            placeholder="Поиск оружия..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white"
          />
        </div>
        <div>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white"
          >
            <option value="all">Все редкости</option>
            <option value="5">5★</option>
            <option value="4">4★</option>
            <option value="3">3★</option>
          </select>
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white"
          >
            <option value="all">Все типы</option>
            <option value="Sword">Меч</option>
            <option value="Claymore">Двуручное</option>
            <option value="Polearm">Древковое</option>
            <option value="Bow">Лук</option>
            <option value="Catalyst">Катализатор</option>
          </select>
        </div>
        <div className="text-white">
          Всего: {filteredWeapons.length}
        </div>
      </div>

      {/* Список оружия */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredWeapons.map((weapon) => (
          <Card key={weapon.id} className="bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors rounded-xl min-h-[240px] flex flex-col justify-between p-4">
            <div className="flex items-start space-x-3 mb-2">
              <div className="relative">
                <OptimizedImage
                  src={getSafeImageUrl(weapon.image, weapon.name, 'weapon')}
                  alt={weapon.name}
                  className="w-12 h-12 rounded object-cover border border-neutral-700"
                  type="weapon"
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base text-white mb-1 line-clamp-1">{weapon.name}</div>
                <div className="text-xs text-neutral-400 mb-1">{weapon.type}</div>
                <div className="text-xs text-neutral-400">ATK: {weapon.baseAttack}</div>
              </div>
            </div>
            {/* Кнопки действий */}
            <div className="mt-2 pt-2 border-t border-neutral-700 flex gap-2 justify-end">
              <IconActionButton 
                variant="view" 
                icon={<Eye />} 
                title="Просмотр"
                onClick={() => openWeaponModal(weapon)}
              />
              <IconActionButton 
                variant="edit" 
                icon={<Pencil />} 
                title="Редактировать"
                onClick={() => window.location.href = `/admin/weapons/${weapon.id}/edit`}
              />
              <IconActionButton 
                variant="delete" 
                icon={<Trash />} 
                title="Удалить"
                onClick={async () => {
                  if (confirm(`Вы уверены, что хотите удалить оружие "${weapon.name}"?`)) {
                    try {
                      const response = await fetch(`/api/weapons/${weapon.id}`, {
                        method: 'DELETE',
                      });
                      
                      if (response.ok) {
                        alert('Оружие успешно удалено!');
                        fetchWeapons(); // Обновляем список
                      } else {
                        const errorData = await response.json();
                        alert(`Ошибка удаления: ${errorData.error || 'Неизвестная ошибка'}`);
                      }
                    } catch (error) {
                      console.error('Ошибка при удалении оружия:', error);
                      alert('Произошла ошибка при удалении оружия');
                    }
                  }
                }}
              />
            </div>
          </Card>
        ))}
      </div>

      {filteredWeapons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Оружие не найдено</p>
        </div>
      )}

      {/* Модальное окно с информацией об оружии */}
      {showModal && selectedWeapon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Заголовок модального окна */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-700">
              <h2 className="text-2xl font-bold text-white">{selectedWeapon.name}</h2>
              <button
                onClick={closeWeaponModal}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Содержимое модального окна */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Изображение оружия */}
                <div className="flex justify-center">
                  <div className="relative">
                    <Image
                      src={getSafeImageUrl(selectedWeapon.image, selectedWeapon.name, 'weapon')}
                      alt={selectedWeapon.name}
                      width={200}
                      height={200}
                      className="rounded-lg border border-neutral-600"
                    />
                  </div>
                </div>

                {/* Информация об оружии */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Основная информация</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">ID:</span>
                        <span className="text-white">{selectedWeapon.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Тип:</span>
                        <span className="text-white">{selectedWeapon.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Редкость:</span>
                        <span className="text-white">{'★'.repeat(selectedWeapon.rarity)}</span>
                      </div>
                      {selectedWeapon.baseAttack && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Базовая атака:</span>
                          <span className="text-white">{selectedWeapon.baseAttack}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Дополнительная характеристика */}
                  {selectedWeapon.subStatName && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Дополнительная характеристика</h3>
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">{selectedWeapon.subStatName}:</span>
                          <span className="text-white">{selectedWeapon.subStatValue}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Пассивная способность */}
                  {selectedWeapon.passiveName && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Пассивная способность</h3>
                      <div className="text-sm">
                        <div className="text-neutral-400 mb-1">{selectedWeapon.passiveName}</div>
                        {selectedWeapon.passiveEffect && (
                          <div className="text-white text-xs leading-relaxed">
                            {selectedWeapon.passiveEffect}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-end gap-3 p-6 border-t border-neutral-700">
              <button
                onClick={closeWeaponModal}
                className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
              >
                Закрыть
              </button>
              <button
                onClick={() => {
                  closeWeaponModal();
                  window.location.href = `/admin/weapons/${selectedWeapon.id}/edit`;
                }}
                className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg transition-colors"
              >
                Редактировать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 