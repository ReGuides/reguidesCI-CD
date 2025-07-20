'use client';

import { useState, useEffect } from 'react';
import { Gift, Star } from 'lucide-react';
import Image from 'next/image';

interface BirthdayCharacter {
  id: string;
  name: string;
  image: string;
  birthday: string;
}

export default function BirthdayBanner() {
  const [birthdayCharacters, setBirthdayCharacters] = useState<BirthdayCharacter[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdayCharacters = async () => {
      try {
        setLoading(true);
        
        // Получаем всех персонажей с днями рождения
        const response = await fetch('/api/characters');
        if (!response.ok) {
          throw new Error('Failed to fetch characters');
        }
        
        const data = await response.json();
        const characters = data.data || [];
        
        // Проверяем, есть ли персонажи с днями рождения сегодня
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // getMonth() возвращает 0-11
        const currentDay = today.getDate();

        const todayBirthdays = characters.filter((char: { birthday?: string }) => {
          if (!char.birthday) return false;
          
          // Парсим день рождения (формат может быть разным)
          let month, day;
          if (char.birthday.includes('-')) {
            [month, day] = char.birthday.split('-').map(Number);
          } else if (char.birthday.includes('/')) {
            [month, day] = char.birthday.split('/').map(Number);
          } else {
            // Если формат неизвестен, пропускаем
            return false;
          }
          
          return month === currentMonth && day === currentDay;
        });

        if (todayBirthdays.length > 0) {
          setBirthdayCharacters(todayBirthdays);
          setShowBanner(true);
        }
      } catch (error) {
        console.error('Error fetching birthday characters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdayCharacters();
  }, []);

  if (loading) {
    return null; // Не показываем ничего во время загрузки
  }

  if (!showBanner || birthdayCharacters.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-6">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">День рождения!</span>
            </div>
            <div className="flex items-center gap-2">
              {birthdayCharacters.map((character, index) => (
                <div key={character.id} className="flex items-center gap-2">
                  {index > 0 && <span className="text-white">и</span>}
                  <Image 
                    src={character.image} 
                    alt={character.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    onError={(e) => {
                      // Fallback если изображение не загрузилось
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <span className="text-white font-medium">{character.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-white" />
            <span className="text-white text-sm">Сегодня особенный день!</span>
          </div>
        </div>
      </div>
    </div>
  );
} 