'use client';

import { useState, useEffect } from 'react';
import { Character } from '@/types';

export default function TestNewCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('/api/characters');
        if (response.ok) {
          const data = await response.json();
          setCharacters(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  // Фильтруем персонажей с patchNumber
  const charactersWithPatch = characters.filter(char => char.patchNumber);
  
  // Сортируем по patchNumber
  const sortedByPatch = [...charactersWithPatch].sort((a, b) => {
    const patchA = a.patchNumber || '0.0';
    const patchB = b.patchNumber || '0.0';
    const [majorA, minorA] = patchA.split('.').map(Number);
    const [majorB, minorB] = patchB.split('.').map(Number);
    return (majorB + minorB / 10) - (majorA + minorA / 10);
  });

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Тест новых персонажей</h1>
      
      <div className="mb-4">
        <p>Всего персонажей: {characters.length}</p>
        <p>С patchNumber: {charactersWithPatch.length}</p>
        <p>Без patchNumber: {characters.length - charactersWithPatch.length}</p>
      </div>

      <h2 className="text-xl font-bold mb-4">Новые персонажи (сортировка по патчу):</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedByPatch.slice(0, 10).map((character) => (
          <div key={character.id} className="border p-4 rounded">
            <h3 className="font-bold">{character.name}</h3>
            <p>Patch: {character.patchNumber}</p>
            <p>Element: {character.element}</p>
            <p>Weapon: {
              typeof character.weapon === 'string' 
                ? character.weapon 
                : (character.weapon?.name?.toString() || 'Не указано')
            }</p>
            {character.image && (
              <img 
                src={character.image} 
                alt={character.name}
                className="w-20 h-20 object-cover rounded"
              />
            )}
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4 mt-8">Все персонажи с patchNumber:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {charactersWithPatch.map((character) => (
          <div key={character.id} className="border p-4 rounded">
            <h3 className="font-bold">{character.name}</h3>
            <p>Patch: {character.patchNumber}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 