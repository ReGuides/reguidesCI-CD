'use client';

import React from 'react';

// Поддерживаемые цвета (как в старой версии)
const COLORS: Record<string, string> = {
  red: 'text-red-400',
  blue: 'text-blue-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  pyro: 'text-red-500',
  hydro: 'text-cyan-400',
  electro: 'text-purple-400',
  cryo: 'text-sky-300',
  anemo: 'text-emerald-400',
  geo: 'text-amber-400',
  dendro: 'text-lime-400',
  orange: 'text-orange-400',
  purple: 'text-purple-400',
  cyan: 'text-cyan-400',
  pink: 'text-pink-400',
  // Алиасы
  голубой: 'text-cyan-400',
  синий: 'text-blue-400',
  зелёный: 'text-green-400',
  жёлтый: 'text-yellow-400',
  оранжевый: 'text-orange-400',
  фиолетовый: 'text-purple-400',
  лаймовый: 'text-lime-400',
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onItemClick?: (type: string, id: string) => void;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '', onItemClick }) => {
  // Главная функция для рендера разметки (как в старой версии)
  const renderRichText = (text: string): React.ReactNode => {
    if (!text) return null;

    // Парсим строки по \n для поддержки переносов
    const lines = text.split(/\n/);
    return lines.map((line, i) => (
      <React.Fragment key={i}>
        {parseLine(line)}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Парсинг строки (как в старой версии)
  const parseLine = (line: string): React.ReactNode => {
    // Сначала ссылки и спец-ссылки: [текст](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    const result: React.ReactNode[] = [];
    let match: RegExpExecArray | null;
    
    while ((match = linkRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        result.push(parseColorsAndBold(line.slice(lastIndex, match.index)));
      }
      const [full, text, href] = match;
      
      if (/^(weapon|artifact|character|talent|constellation):/.test(href)) {
        // Спец-ссылка
        const [type, id] = href.split(':');
        result.push(
          <button
            key={href + match.index}
            className="underline text-blue-400 cursor-pointer hover:text-blue-300 transition-colors"
            onClick={() => onItemClick?.(type, id)}
          >
            {text}
          </button>
        );
      } else {
        // Обычная ссылка
        result.push(
          <a
            key={href + match.index}
            href={href}
            className="underline text-blue-400 hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </a>
        );
      }
      lastIndex = match.index + full.length;
    }
    
    if (lastIndex < line.length) {
      result.push(parseColorsAndBold(line.slice(lastIndex)));
    }
    return result;
  };

  // Парсинг цветов и жирного текста (как в старой версии)
  const parseColorsAndBold = (text: string): React.ReactNode => {
    // Цвет: [color:текст]
    const colorRegex = /\[([a-z]+):([^\]]+)\]/gi;
    let lastIndex = 0;
    const result: React.ReactNode[] = [];
    let match: RegExpExecArray | null;
    
    while ((match = colorRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push(parseBold(text.slice(lastIndex, match.index)));
      }
      const [full, color, inner] = match;
      const colorClass = COLORS[color.toLowerCase()] || '';
      result.push(
        <span key={color + match.index} className={colorClass}>
          {parseBold(inner)}
        </span>
      );
      lastIndex = match.index + full.length;
    }
    
    if (lastIndex < text.length) {
      result.push(parseBold(text.slice(lastIndex)));
    }
    return result;
  };

  // Парсинг жирного текста (как в старой версии)
  const parseBold = (text: string): React.ReactNode => {
    // Жирный: **текст** или __текст__
    const boldRegex = /\*\*([^*]+)\*\*|__([^_]+)__/g;
    let lastIndex = 0;
    const result: React.ReactNode[] = [];
    let match: RegExpExecArray | null;
    
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push(text.slice(lastIndex, match.index));
      }
      const boldText = match[1] || match[2];
      result.push(
        <strong key={match.index} className="font-bold text-white">
          {boldText}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }
    return result;
  };

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <div className="text-gray-300 leading-relaxed">
        {renderRichText(content)}
      </div>
    </div>
  );
};

export default MarkdownRenderer; 