'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function DebugWeaponPage() {
  const params = useParams();
  const weaponId = params.id as string;
  const [weapon, setWeapon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchWeapon = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/debug/weapon/${weaponId}`);
        const data = await response.json();
        
        if (response.ok) {
          setWeapon(data.weapon);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch weapon');
      } finally {
        setLoading(false);
      }
    };

    if (weaponId) {
      fetchWeapon();
    }
  }, [weaponId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-white">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">
        Debug Weapon: {weaponId}
      </h1>
      
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Данные оружия:</h2>
        
        <div className="space-y-2">
          <div className="text-white">
            <strong>ID:</strong> {weapon?.id}
          </div>
          <div className="text-white">
            <strong>Название:</strong> {weapon?.name}
          </div>
          <div className="text-white">
            <strong>Тип:</strong> {weapon?.type}
          </div>
          <div className="text-white">
            <strong>Редкость:</strong> {weapon?.rarity}
          </div>
          <div className="text-white">
            <strong>Изображение:</strong> {weapon?.image}
          </div>
          <div className="text-white">
            <strong>Базовая атака:</strong> {weapon?.baseAttack}
          </div>
          <div className="text-white">
            <strong>Доп. характеристика:</strong> {weapon?.subStatName}
          </div>
          <div className="text-white">
            <strong>Значение доп. характеристики:</strong> {weapon?.subStatValue}
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-2">Полные данные (JSON):</h3>
          <pre className="bg-neutral-900 p-4 rounded text-sm text-green-400 overflow-auto">
            {JSON.stringify(weapon, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
