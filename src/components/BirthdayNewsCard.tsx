'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cake, ExternalLink, Heart, Star, Zap, Trophy, Gem } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface BirthdayNewsCardProps {
  news: {
    _id: string;
    title: string;
    content: string;
    characterId?: string;
    characterName?: string;
    characterImage?: string;
    image?: string;
    createdAt: string;
    tags: string[];
  };
}

export default function BirthdayNewsCard({ news }: BirthdayNewsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Функция для преобразования текста с разметкой в JSX
  const renderContent = (content: string) => {
    // Разбиваем на строки
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // Обрабатываем жирный текст с ссылками
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <div key={index} className="mb-2">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <strong key={partIndex} className="text-purple-400 font-bold">
                  {renderLinks(part)}
                </strong>
              ) : (
                <span key={partIndex}>{renderLinks(part)}</span>
              )
            )}
          </div>
        );
      }
      
      // Обрабатываем маркированные списки
      if (line.startsWith('•')) {
        const icon = getIconForLine(line);
        return (
          <div key={index} className="flex items-start gap-2 mb-2 text-sm">
            <span className="text-yellow-400 mt-0.5">{icon}</span>
            <span className="flex-1">{renderLinks(line.substring(1).trim())}</span>
          </div>
        );
      }
      
      // Обычный текст
      if (line.trim()) {
        return <div key={index} className="mb-2">{renderLinks(line)}</div>;
      }
      
      // Пустые строки
      return <div key={index} className="mb-3"></div>;
    });
  };

  // Функция для обработки ссылок в тексте
  const renderLinks = (text: string) => {
    // Ищем ссылки в формате [текст](/путь)
    const linkRegex = /\[([^\]]+)\]\(\/([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Добавляем текст до ссылки
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Добавляем ссылку
      parts.push(
        <Link
          key={match.index}
          href={`/${match[2]}`}
          className="text-purple-400 hover:text-purple-300 underline font-medium inline-flex items-center gap-1"
        >
          {match[1]}
          <ExternalLink className="w-3 h-3" />
        </Link>
      );

      lastIndex = match.index + match[0].length;
    }

    // Добавляем оставшийся текст
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
  };

  // Функция для определения иконки по содержимому строки
  const getIconForLine = (line: string) => {
    if (line.includes('силы')) return <Zap className="w-4 h-4" />;
    if (line.includes('точности')) return <Star className="w-4 h-4" />;
    if (line.includes('артефактов')) return <Gem className="w-4 h-4" />;
    if (line.includes('роста')) return <Zap className="w-4 h-4" />;
    if (line.includes('Спиральной Бездны')) return <Trophy className="w-4 h-4" />;
    if (line.includes('удачи')) return <Heart className="w-4 h-4" />;
    return <Heart className="w-4 h-4" />;
  };



  return (
    <Card className="bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Cake className="w-5 h-5 text-pink-400" />
              {news.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-pink-600 text-white text-xs">
                🎂 День рождения
              </Badge>
              <Badge variant="outline" className="border-purple-500 text-purple-400 text-xs">
                {new Date(news.createdAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Badge>
            </div>
          </div>
          
          {/* Изображение персонажа */}
          {news.image && (
            <div className="relative">
              <Image
                src={news.image}
                alt={news.characterName || 'Персонаж'}
                width={80}
                height={80}
                className="rounded-lg object-cover border-2 border-pink-500/30"
              />
              <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                🎉
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-gray-300 leading-relaxed">
          {isExpanded ? (
            <div className="space-y-2">
              {renderContent(news.content)}
            </div>
          ) : (
            <div className="space-y-2">
              {renderContent(news.content.split('\n').slice(0, 8).join('\n'))}
              {news.content.split('\n').length > 8 && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(true)}
                    className="border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white"
                  >
                    Читать полностью
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Теги */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-pink-500/20">
          {news.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="border-pink-500/30 text-pink-400 text-xs hover:bg-pink-500/20"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Кнопка перехода к персонажу */}
        {news.characterId && news.characterName && (
          <div className="mt-4 pt-4 border-t border-pink-500/20">
            <Link href={`/characters/${news.characterId}`}>
              <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                <Star className="w-4 h-4 mr-2" />
                Прокачать {news.characterName} в день рождения! 🎂
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
