'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import ImageCarousel from './image-carousel';
import Image from 'next/image';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Кастомные стили для заголовков
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-white mb-6 mt-8 border-b border-neutral-700 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-white mb-4 mt-6">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold text-white mb-3 mt-5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold text-white mb-2 mt-4">
              {children}
            </h4>
          ),
          // Кастомные стили для параграфов
          p: ({ children }) => (
            <p className="text-neutral-300 mb-4 leading-relaxed">
              {children}
            </p>
          ),
          // Кастомные стили для списков
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-neutral-300 mb-4 space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-neutral-300">
              {children}
            </li>
          ),
          // Кастомные стили для ссылок
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-accent hover:text-accent/80 underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Кастомные стили для блоков кода
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-neutral-800 text-accent px-1 py-0.5 rounded text-sm">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-neutral-800 text-neutral-300 p-4 rounded-lg overflow-x-auto text-sm">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-neutral-800 text-neutral-300 p-4 rounded-lg overflow-x-auto mb-4">
              {children}
            </pre>
          ),
          // Кастомные стили для цитат
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent pl-4 italic text-neutral-400 mb-4">
              {children}
            </blockquote>
          ),
          // Кастомные стили для таблиц
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-neutral-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-neutral-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-neutral-900">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-neutral-700">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="border border-neutral-700 px-4 py-2 text-left text-white font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-neutral-700 px-4 py-2 text-neutral-300">
              {children}
            </td>
          ),
          // Кастомные стили для изображений
          img: ({ src, alt }) => {
            // Если src начинается с http://localhost:3000, обрезаем до относительного
            let safeSrc = src || '';
            if (safeSrc.startsWith('http://localhost:3000')) {
              safeSrc = safeSrc.replace('http://localhost:3000', '');
            }
            // Если src не начинается с /, добавить /images/articles/
            if (safeSrc && !safeSrc.startsWith('/')) {
              safeSrc = `/images/articles/${safeSrc}`;
            }
            return (
              <Image 
                src={safeSrc}
                alt={alt || ''}
                width={800}
                height={600}
                className="max-w-full h-auto rounded-lg my-4"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder.png';
                }}
              />
            );
          },
          // Кастомные компоненты для div элементов
          div: ({ className, children, ...props }) => {
            // Обработка контейнеров изображений с обтеканием
            if (className?.includes('image-container')) {
              const isFloatLeft = className.includes('float-left');
              const isFloatRight = className.includes('float-right');
              const isCenter = className.includes('mx-auto');
              
              let floatClass = '';
              if (isFloatLeft) floatClass = 'float-left mr-4 mb-4';
              else if (isFloatRight) floatClass = 'float-right ml-4 mb-4';
              else if (isCenter) floatClass = 'mx-auto mb-4';
              
              return (
                <div className={`${floatClass} ${className}`} {...props}>
                  {children}
                </div>
              );
            }

            // Обработка карусели изображений
            if (className?.includes('carousel-placeholder')) {
              try {
                const imagesData = (props as Record<string, unknown>)['data-images'];
                if (imagesData) {
                  const images = JSON.parse(imagesData as string);
                  return <ImageCarousel images={images} className="my-6" />;
                }
              } catch (error) {
                console.error('Error parsing carousel data:', error);
              }
            }

            return <div className={className} {...props}>{children}</div>;
          },
          // Кастомные стили для горизонтальной линии
          hr: () => (
            <hr className="border-neutral-700 my-8" />
          ),
          // Кастомные стили для выделения
          strong: ({ children }) => (
            <strong className="font-bold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-neutral-200">
              {children}
            </em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 