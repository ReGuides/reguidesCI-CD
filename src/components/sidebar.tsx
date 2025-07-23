'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Character, News, Advertisement, About } from '@/types';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import Image from 'next/image';

export default function Sidebar() {
  const router = useRouter();
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);

  // Загружаем данные
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загружаем персонажей
        const charactersResponse = await fetch('/api/characters');
        if (charactersResponse.ok) {
          const charactersData = await charactersResponse.json();
          setCharacters(charactersData.data || []);
        }

        // Загружаем новости
        const newsResponse = await fetch('/api/news');
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          setNews(newsData || []);
        }

        // Загружаем рекламу
        const adsResponse = await fetch('/api/advertisements/active');
        if (adsResponse.ok) {
          const adsData = await adsResponse.json();
          setAdvertisements(adsData || []);
        }

        // Загружаем информацию о поддержке
        const aboutResponse = await fetch('/api/about');
        if (aboutResponse.ok) {
          const aboutData = await aboutResponse.json();
          setAbout(aboutData || null);
        }
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Получаем персонажа дня (с днем рождения или случайного)
  const characterOfTheDay = useMemo(() => {
    if (characters.length === 0) return null;

    const today = new Date();
    const todayString = today.toDateString(); // Используем полную дату для стабильности
    
    // Ищем персонажа с днем рождения сегодня
    const birthdayCharacter = characters.find(char => {
      if (!char.birthday) return false;
      const birthday = new Date(char.birthday);
      const birthdayString = `${birthday.getMonth() + 1}/${birthday.getDate()}`;
      const todayBirthdayString = `${today.getMonth() + 1}/${today.getDate()}`;
      return birthdayString === todayBirthdayString;
    });

    if (birthdayCharacter) {
      return { character: birthdayCharacter, isBirthday: true };
    }

    // Если нет именинника, берем случайного персонажа на основе даты
    // Используем дату как seed для генератора случайных чисел
    const seed = todayString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomIndex = seed % characters.length;
    return { character: characters[randomIndex], isBirthday: false };
  }, [characters]);

  // Получаем последние новости
  const latestNews = useMemo(() => {
    return news
      .sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(0);
        const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 3);
  }, [news]);

  // Получаем URL поддержки
  const supportUrl = useMemo(() => {
    if (!about?.supportProject) return null;
    
    if (about.supportProject.startsWith('http')) {
      return about.supportProject;
    }
    
    // Обработка iframe
    if (about.supportProject.trim().startsWith('<iframe')) {
      const srcMatch = about.supportProject.match(/src="([^"]*)"/);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1].replace('/button?', '/form?');
      }
    }
    
    return null;
  }, [about]);

  if (loading) {
    return (
      <div className="w-72 space-y-6">
        <div className="bg-neutral-800 rounded-lg shadow-lg p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-700 rounded mb-2"></div>
            <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 space-y-6">
      {/* Персонаж дня */}
      {characterOfTheDay && (
        <div 
          className="bg-neutral-800 rounded-lg shadow-lg overflow-hidden group cursor-pointer"
          onClick={() => router.push(`/characters/${characterOfTheDay.character.id}`)}
        >
          <div className="relative h-48">
            <Image
              src={getImageWithFallback(characterOfTheDay.character.image, characterOfTheDay.character.name, 'character')}
              alt={characterOfTheDay.character.name}
              width={288}
              height={192}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.opacity = '0.2';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-bold text-lg mb-1">{characterOfTheDay.character.name}</h3>
              <p className="text-gray-300 text-sm">
                {characterOfTheDay.isBirthday ? '🎂 День рождения!' : 'Персонаж дня'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Последние новости */}
      <div className="bg-neutral-800 rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-bold mb-3 text-white">Последние новости</h3>
        {latestNews.length > 0 ? (
          <div className="space-y-3">
            {latestNews.map((item, index) => (
              <div
                key={item._id || index}
                className="cursor-pointer hover:bg-neutral-700 rounded-lg p-3 transition-colors"
                onClick={() => setSelectedNews(item)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-1 h-8 rounded ${item.type === 'genshin' ? 'bg-blue-400' : 'bg-yellow-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 mb-1">
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('ru-RU') : 'Дата не указана'}
                    </div>
                    <h4 className="text-white font-semibold text-sm leading-tight mb-1">
                      {item.title}
                    </h4>
                    <p className="text-gray-300 text-xs line-clamp-2">
                      {item.summary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Новостей пока нет</p>
        )}
      </div>

      {/* Реклама */}
      {advertisements.length > 0 ? (
        <div className="bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
          {advertisements.map((ad, index) => (
            <div key={ad._id || index} className="relative">
              {ad.backgroundImage && (
                <div className="relative h-32">
                  <Image
                    src={ad.backgroundImage}
                    alt={ad.title}
                    width={288}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>
              )}
              <div className="p-4">
                <h4 className="text-white font-semibold text-sm mb-2">{ad.title}</h4>
                <p className="text-gray-300 text-xs mb-3 line-clamp-2">{ad.description}</p>
                <a
                  href={ad.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors"
                >
                  {ad.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-neutral-800 rounded-lg shadow-lg p-4">
          <p className="text-gray-400 text-sm text-center">Тут могла быть ваша реклама</p>
        </div>
      )}

      {/* Кнопка поддержки */}
      {supportUrl ? (
        <div className="bg-neutral-800 rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-white">Поддержать проект</h3>
          <button
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow transition-colors text-lg"
            onClick={() => window.open(supportUrl, '_blank', 'noopener,noreferrer')}
          >
            Поддержать
          </button>
        </div>
      ) : (
        <div className="bg-neutral-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Кнопка поддержки не настроена</p>
        </div>
      )}

      {/* Модальное окно для новостей */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">{selectedNews.title}</h2>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {selectedNews.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 