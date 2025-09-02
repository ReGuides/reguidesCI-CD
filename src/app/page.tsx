'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterCard } from '@/components/character-card';
import { Character } from '@/types';
import BirthdayBanner from '@/components/birthday-banner';
import MobileSidebar from '@/components/mobile-sidebar';
import NewsSection from '@/components/news-section';
import FriendsSection from '@/components/friends-section';
import CharacterCarousel from '@/components/character-carousel';
import LoadingSpinner from '@/components/ui/loading-spinner';
import PageTitle from '@/components/ui/page-title';


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
  return (
    <>
      <PageTitle title="Главная" />
      <HomePageContent />
    </>
  );
}

function HomePageContent() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [allStats, setAllStats] = useState<{ _id: string; views: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Для баннера — 3 самых новых
  const newest3Characters = useMemo(() => {
    if (!Array.isArray(characters) || !characters) return [];
    const withPatch = [...characters]
      .filter(char => char && char.patchNumber) // Только персонажи с patchNumber
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
    if (!Array.isArray(characters) || !characters) return [];
    return [...characters]
      .filter(char => char && char.patchNumber) // Только персонажи с patchNumber
      .sort(sortByPatchNumber)
      .slice(0, 6);
  }, [characters]);

  // 4 самых просматриваемых (исключая новых)
  const top4Viewed = useMemo(() => {
    if (!Array.isArray(characters) || !characters || !Array.isArray(allStats) || allStats.length === 0) return [];
    const newIds = new Set(newest3Characters.map(c => c.id));
    return [...allStats]
      .filter(v => v && v.views > 0 && !newIds.has(v._id))
      .sort((a, b) => b.views - a.views)
      .slice(0, 4)
      .map(v => v._id);
  }, [allStats, newest3Characters, characters]);

  // Баннер: 3 новых + 4 самых просматриваемых
  const bannerCharacters = useMemo(() => {
    if (!Array.isArray(characters) || !characters) return [];
    const result: Character[] = [];
    
    // Добавляем 3 новых персонажа
    for (const char of newest3Characters) {
      if (char) result.push(char);
    }
    
    // Добавляем 4 самых просматриваемых
    for (const id of top4Viewed) {
      const char = characters.find(c => c && c.id === id);
      if (char && !result.some(c => c.id === char.id)) {
        result.push(char);
      }
    }
    
    // Если нет просматриваемых, добавляем еще персонажей до 7
    if (result.length < 7) {
      const remaining = characters.filter(c => c && !result.some(r => r.id === c.id));
      for (const char of remaining.slice(0, 7 - result.length)) {
        result.push(char);
      }
    }
    
    return result;
  }, [characters, newest3Characters, top4Viewed]);

  // Рандомные персонажи (без повторов с баннера и новых)
  const randomBlockCharacters = useMemo(() => {
    if (!Array.isArray(characters) || !characters) return [];
    const excludeIds = new Set([...bannerCharacters, ...newest6Characters].map(c => c && c.id).filter(Boolean));
    const pool = characters.filter(c => c && !excludeIds.has(c.id));
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
            const formattedData = viewsData.map((item: { characterId: string; totalViews?: number }) => ({
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
    <div className="w-full min-h-[400px]">
      {/* Баннер дней рождения */}
      <div className="w-full max-w-7xl mx-auto px-4">
        <BirthdayBanner />
      </div>

      {/* Character Carousel */}
      {Array.isArray(bannerCharacters) && bannerCharacters.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4">
          <CharacterCarousel 
            characters={bannerCharacters}
            autoPlay={true}
            autoPlayInterval={7000}
          />
        </div>
      )}

      {/* Основной контент */}
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex-1 min-w-0">
            {/* Новые персонажи */}
            {Array.isArray(newest6Characters) && newest6Characters.length > 0 && (
              <div className="mt-12 sm:mt-16">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Новые персонажи</h2>
                <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {newest6Characters.map(character => {
                    if (!character || typeof character !== 'object') return null;
                    return (
                      <div key={`new-${character.id}`} onClick={() => router.push(`/characters/${character.id}`)} className="cursor-pointer">
                        <CharacterCard character={character} />
                      </div>
                    );
                  })}
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
            )}

            {/* Мобильная версия сайдбара */}
            <div className="w-full my-4 lg:hidden">
              <MobileSidebar />
            </div>

            {/* Блок новостей */}
            <NewsSection />

            {/* Случайные персонажи */}
            <div className="mt-12 sm:mt-16">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Случайные персонажи</h2>
              <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.isArray(randomBlockCharacters) && randomBlockCharacters.map(character => {
                  if (!character || typeof character !== 'object') return null;
                  return (
                    <div key={`random-${character.id}`} onClick={() => router.push(`/characters/${character.id}`)} className="cursor-pointer">
                      <CharacterCard character={character} />
                    </div>
                  );
                })}
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

            {/* Блок друзей проекта */}
            <FriendsSection />
        </div>
      </div>
    </div>
  );
}
