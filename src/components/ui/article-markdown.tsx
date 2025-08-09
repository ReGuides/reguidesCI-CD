'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Schema } from 'hast-util-sanitize';
import type { Pluggable, PluggableList } from 'unified';

interface ArticleMarkdownProps {
  content: string;
  className?: string;
}

// Санитайзер: разрешаем базовые теги + изображения/таблицы и className
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
      'href', 'title', 'target', 'rel', 'className',
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
  protocols: {
    ...(defaultSchema.protocols || {}),
    href: [
      ...(((defaultSchema.protocols && defaultSchema.protocols.href) || []) as string[]),
      'relative',
    ],
    src: [
      ...(((defaultSchema.protocols && (defaultSchema as any).protocols?.src) || []) as string[]),
      'data', 'relative',
    ],
  },
};

const ArticleMarkdown: React.FC<ArticleMarkdownProps> = ({ content, className = '' }) => {
  const remarkPluginsList: PluggableList = [
    remarkGfm as unknown as Pluggable,
    remarkBreaks as unknown as Pluggable,
  ];

  const rehypePluginsList: PluggableList = [
    rehypeRaw as unknown as Pluggable,
    [rehypeSanitize, sanitizeSchema] as unknown as Pluggable,
  ];

  const components: Components = {
    a: ({ href, children }) => (
      <a
        href={(href as string) || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-blue-400 hover:text-blue-300"
      >
        {children}
      </a>
    ),
    img: ({ src, alt }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={(src || '').toString()}
        alt={alt || ''}
        className="max-w-full h-auto rounded"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    ),
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
  };

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={remarkPluginsList}
        rehypePlugins={rehypePluginsList}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default ArticleMarkdown;


