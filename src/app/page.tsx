'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CharacterCard } from '@/components/character-card';
import { Character, Weapon, Artifact } from '@/types';
import { Eye, Star, Calendar, User } from 'lucide-react';
import BirthdayBanner from '@/components/birthday-banner';
import MobileSidebar from '@/components/mobile-sidebar';
import NewsSection from '@/components/news-section';
import FriendsSection from '@/components/friends-section';
import CharacterCarousel from '@/components/character-carousel';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import LoadingSpinner from '@/components/ui/loading-spinner';



function parsePatchNumber(patch?: string): number {
  if (!patch) return 0;
  const [major, minor] = patch.split('.').map(Number);
  return (major || 0) + (minor || 0) / 10;
}

function sortByPatchNumber(a: Character, b: Character): number {
  const patchA = parsePatchNumber(a.patchNumber);
  const patchB = parsePatchNumber(b.patchNumber);
  return patchB - patchA; // Сортировка по убыванию (новые сначала)
}

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    characters: 0,
    weapons: 0,
    artifacts: 0
  });
  const [characters, setCharacters] = useState<Character[]>([]);
  const [allStats, setAllStats] = useState<{ _id: string; views: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Получить просмотры по id
  const getViews = (id: string) => {
    const found = allStats.find(v => v._id === id);
    return found ? found.views : 0;
  };

  // Для баннера — 3 самых новых
  const newest3Characters = useMemo(() => {
    if (!characters) return [];
    const withPatch = [...characters]
      .filter(char => char.patchNumber) // Только персонажи с patchNumber
      .sort(sortByPatchNumber)
      .slice(0, 3);
    
    // Если нет персонажей с patchNumber, берем первые 3
    if (withPatch.length === 0) {
      return characters.slice(0, 3);
    }
    
    return withPatch;
  }, [characters]);

  // Для блока — 6 самых новых
  const newest6Characters = useMemo(() => {
    if (!characters) return [];
    return [...characters]
      .filter(char => char.patchNumber) // Только персонажи с patchNumber
      .sort(sortByPatchNumber)
      .slice(0, 6);
  }, [characters]);

  // 4 самых просматриваемых (исключая новых)
  const top4Viewed = useMemo(() => {
    if (!characters || allStats.length === 0) return [];
    const newIds = new Set(newest3Characters.map(c => c.id));
    return [...allStats]
      .filter(v => v.views > 0 && !newIds.has(v._id))
      .sort((a, b) => b.views - a.views)
      .slice(0, 4)
      .map(v => v._id);
  }, [allStats, newest3Characters]);

  // Баннер: 3 новых + 4 самых просматриваемых
  const bannerCharacters = useMemo(() => {
    if (!characters) return [];
    const result: Character[] = [];
    
    // Добавляем 3 новых персонажа
    for (const char of newest3Characters) {
      result.push(char);
    }
    
    // Добавляем 4 самых просматриваемых
    for (const id of top4Viewed) {
      const char = characters.find(c => c.id === id);
      if (char && !result.some(c => c.id === char.id)) {
        result.push(char);
      }
    }
    
    // Если нет просматриваемых, добавляем еще персонажей до 7
    if (result.length < 7) {
      const remaining = characters.filter(c => !result.some(r => r.id === c.id));
      for (const char of remaining.slice(0, 7 - result.length)) {
        result.push(char);
      }
    }
    
    return result;
  }, [characters, newest3Characters, top4Viewed]);

  // Рандомные персонажи (без повторов с баннера и новых)
  const randomBlockCharacters = useMemo(() => {
    if (!characters) return [];
    const excludeIds = new Set([...bannerCharacters, ...newest6Characters].map(c => c.id));
    const pool = characters.filter(c => !excludeIds.has(c.id));
    // Перемешать
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 6);
  }, [characters, bannerCharacters, newest6Characters]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем статистику
        const statsResponse = await fetch('/api/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Получаем персонажей
        const charactersResponse = await fetch('/api/characters');
        if (charactersResponse.ok) {
          const charactersData = await charactersResponse.json();
          setCharacters(charactersData.data || []);
        }

        // Получаем статистику просмотров
        try {
          const viewsResponse = await fetch('/api/character-views/public-stats');
          if (viewsResponse.ok) {
            const viewsData = await viewsResponse.json();
            const formattedData = viewsData.map((item: any) => ({
              _id: item.characterId,
              views: item.totalViews || 0
            }));
            setAllStats(formattedData);
          } else {
            console.warn('Failed to fetch character views, using empty stats');
            setAllStats([]);
          }
        } catch (error) {
          console.warn('Error fetching character views, using empty stats:', error);
          setAllStats([]);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-accent" />
        <span className="ml-3 text-neutral-400">Загрузка...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
      {/* Баннер дней рождения */}
      <div className="w-full max-w-7xl mx-auto px-4">
        <BirthdayBanner />
      </div>

      {/* Hero Section */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            ReGuides
          </h1>
          <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            Полное руководство по Genshin Impact. Изучите персонажей, оружия и артефакты с подробными характеристиками и рекомендациями.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <div className="text-3xl font-bold text-accent mb-2">{stats.characters}</div>
              <div className="text-neutral-400">Персонажей</div>
            </div>
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <div className="text-3xl font-bold text-accent mb-2">{stats.weapons}</div>
              <div className="text-neutral-400">Оружий</div>
            </div>
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <div className="text-3xl font-bold text-accent mb-2">{stats.artifacts}</div>
              <div className="text-neutral-400">Артефактов</div>
            </div>
          </div>
        </div>
      </div>

      {/* Character Carousel */}
      {bannerCharacters.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4">
          <CharacterCarousel 
            characters={bannerCharacters}
            autoPlay={true}
            autoPlayInterval={7000}
          />
        </div>
      )}

      {/* Новые персонажи */}
      <div className="w-full max-w-7xl mx-auto mt-12 sm:mt-16 px-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Новые персонажи</h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {newest6Characters.map(character => (
            <div key={`new-${character.id}`} onClick={() => router.push(`/characters/${character.id}`)} className="cursor-pointer">
              <CharacterCard character={character} />
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button 
            className="px-6 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold transition" 
            onClick={() => router.push('/characters')}
          >
            Все персонажи
          </button>
        </div>
      </div>

      {/* Случайные персонажи */}
      <div className="w-full max-w-7xl mx-auto mt-12 sm:mt-16 px-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Случайные персонажи</h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {randomBlockCharacters.map(character => (
            <div key={`random-${character.id}`} onClick={() => router.push(`/characters/${character.id}`)} className="cursor-pointer">
              <CharacterCard character={character} />
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button 
            className="px-6 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold transition" 
            onClick={() => router.push('/characters')}
          >
            Все персонажи
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="w-full max-w-7xl mx-auto mt-12 sm:mt-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
            <h3 className="text-xl font-bold text-white mb-4">Оружия</h3>
            <p className="text-neutral-300 mb-4">
              Изучите все оружия Genshin Impact с подробными характеристиками и пассивными способностями.
            </p>
            <Link 
              href="/weapons" 
              className="inline-block bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
            >
              Перейти к оружиям
            </Link>
          </div>
          
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
            <h3 className="text-xl font-bold text-white mb-4">Артефакты</h3>
            <p className="text-neutral-300 mb-4">
              Изучите все артефакты Genshin Impact с подробными характеристиками и бонусами комплектов.
            </p>
            <Link 
              href="/artifacts" 
              className="inline-block bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
            >
              Перейти к артефактам
            </Link>
          </div>
        </div>
      </div>

      {/* Мобильная версия сайдбара */}
      <div className="w-full my-4">
        <MobileSidebar />
      </div>

      {/* Блок новостей */}
      <NewsSection />

      {/* Блок друзей проекта */}
      <FriendsSection />
    </div>
  );
}
