'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Weapon } from '@/types';
import { getSafeImageUrl } from '@/lib/utils/imageUtils';
import LoadingSpinner from '@/components/ui/loading-spinner';


export default function WeaponDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <WeaponDetailPageContent params={params} />
    </>
  );
}

function WeaponDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Устанавливаем заголовок страницы
  useEffect(() => {
    if (weapon) {
      document.title = `${weapon.name} - ReGuides`;
    }
  }, [weapon]);

  useEffect(() => {
    const fetchWeapon = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/weapons/${id}`);
        if (!response.ok) {
          throw new Error('Weapon not found');
        }
        
        const data = await response.json();
        setWeapon(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWeapon();
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/weapons" className="text-blue-600 hover:underline">
          ← Back to Weapons
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" className="text-blue-600" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      )}

      {/* Weapon Content */}
      {!loading && !error && weapon && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Weapon Image */}
            <div className="md:w-1/3">
              <div className="relative">
                                 <Image
                   src={getSafeImageUrl(weapon.image, weapon.name, 'weapon')}
                   alt={weapon.name}
                   width={400}
                   height={600}
                   className="w-full h-96 md:h-full object-cover"
                   onError={() => {
                     // Next.js Image автоматически обрабатывает ошибки
                   }}
                 />
                {weapon.rarity && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                    {weapon.rarity}★
                  </div>
                )}
              </div>
            </div>

            {/* Weapon Info */}
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold mb-4">{weapon.name}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                  <div className="space-y-3">
                    {weapon.type && (
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {weapon.type}
                        </span>
                      </div>
                    )}
                    {weapon.rarity && (
                      <div>
                        <span className="font-medium text-gray-700">Rarity:</span>
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                          {weapon.rarity}★
                        </span>
                      </div>
                    )}
                    {weapon.baseAttack && (
                      <div>
                        <span className="font-medium text-gray-700">Base ATK:</span>
                        <span className="ml-2">{weapon.baseAttack}</span>
                      </div>
                    )}
                    {weapon.subStatName && (
                      <div>
                        <span className="font-medium text-gray-700">Sub Stat:</span>
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          {weapon.subStatName} {weapon.subStatValue}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Passive Ability */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Passive Ability</h2>
                  {weapon.passiveName && (
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2">{weapon.passiveName}</span>
                      </div>
                      {weapon.passiveEffect && (
                        <div>
                          <span className="font-medium text-gray-700">Effect:</span>
                          <p className="mt-2 text-gray-700 leading-relaxed">{weapon.passiveEffect}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Not Found State */}
      {!loading && !error && !weapon && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Weapon not found</h2>
        </div>
      )}
    </div>
  );
} 