'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Schema } from 'hast-util-sanitize';

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
  // Алиасы (рус)
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

// Безопасная схема для HTML внутри markdown
const sanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'span', 'img', 'table', 'thead', 'tbody', 'th', 'tr', 'td',
  ],
  attributes: {
    ...(defaultSchema.attributes || {}),
    '*': [
      ...((defaultSchema.attributes && defaultSchema.attributes['*']) || []),
      'className',
    ],
    a: [
      ...((defaultSchema.attributes && defaultSchema.attributes.a) || []),
      'href', 'target', 'rel', 'className',
    ],
    img: [
      ...((defaultSchema.attributes && defaultSchema.attributes.img) || []),
      'src', 'alt', 'width', 'height', 'className',
    ],
    span: [
      ...((defaultSchema.attributes && defaultSchema.attributes.span) || []),
      'className',
    ],
  },
};

// Преобразуем нашу кастомную раскраску [color:текст] в безопасный HTML перед парсингом markdown
function preprocessColors(input: string): string {
  if (!input) return '';

  const replaceYoVariants = (s: string) => s.replace(/ё/g, 'е');

  return input.replace(/\[([a-zA-Zа-яА-ЯёЁ]+):([^\]]+)\]/g, (_m: string, rawColor: string, inner: string) => {
    const c1 = rawColor.toLowerCase();
    const c2 = replaceYoVariants(c1);
    const c3 = c2.replace(/e/g, 'ё');
    const colorClass = COLORS[c1] || COLORS[c2] || COLORS[c3];
    if (!colorClass) return inner; // если цвет неизвестен — вернуть текст без обертки
    return `<span class="${colorClass}">${inner}</span>`;
  });
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '', onItemClick }) => {
  const processed = preprocessColors(content);

  const markdownComponents: Components = {
    a: ({ href, children }) => {
      const url = href || '';
      if (typeof url === 'string' && /^(weapon|artifact|character|talent|constellation):/.test(url)) {
        const [type, idRaw] = url.split(':');
        let id = idRaw || '';
        if (type === 'talent' && id.includes('_')) {
          id = id.split('_')[0];
        }
        return (
          <button
            className="underline text-blue-400 cursor-pointer hover:text-blue-300 transition-colors"
            onClick={() => onItemClick?.(type, id)}
          >
            {children}
          </button>
        );
      }
      return (
        <a href={url as string} target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300">
          {children}
        </a>
      );
    },
    code: ({ inline, className: cls, children, ...props }: {
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
    } & React.HTMLAttributes<HTMLElement>) => {
      const base = 'text-sm';
      if (inline) {
        return (
          <code className={`px-1 py-0.5 rounded bg-neutral-800 text-pink-300 ${base}`} {...props}>
            {children}
          </code>
        );
      }
      return (
        <pre className="p-3 rounded bg-neutral-900 overflow-x-auto">
          <code className={`text-neutral-200 ${base} ${cls || ''}`} {...props}>
            {children}
          </code>
        </pre>
      );
    },
    img: ({ src, alt }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src || ''}
        alt={alt || ''}
        className="max-w-full h-auto rounded"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    ),
  };

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeRaw], [rehypeSanitize, sanitizeSchema]]}
        components={markdownComponents}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;