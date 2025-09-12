'use client';

import React from 'react';

interface HtmlContentProps {
  content: string;
  className?: string;
}

export default function HtmlContent({ content, className = '' }: HtmlContentProps) {
  return (
    <>
      <div 
        className={`text-gray-300 leading-relaxed html-content ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      {/* Стили для HTML контента */}
      <style jsx global>{`
        .html-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          margin-top: 2rem;
          line-height: 1.2;
        }
        .html-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.75rem;
          margin-top: 1.5rem;
          line-height: 1.3;
        }
        .html-content h3 {
          font-size: 1.25rem;
          font-weight: 500;
          color: white;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
          line-height: 1.4;
        }
        .html-content h4 {
          font-size: 1.125rem;
          font-weight: 500;
          color: #e5e7eb;
          margin-bottom: 0.5rem;
          margin-top: 0.75rem;
          line-height: 1.4;
        }
        .html-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
          color: #d1d5db;
        }
        .html-content ul {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .html-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .html-content li {
          margin-bottom: 0.5rem;
          color: #d1d5db;
          line-height: 1.6;
        }
        .html-content strong {
          font-weight: 600;
          color: white;
        }
        .html-content b {
          font-weight: 600;
          color: white;
        }
        .html-content em {
          font-style: italic;
          color: #d1d5db;
        }
        .html-content i {
          font-style: italic;
          color: #d1d5db;
        }
        .html-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .html-content a:hover {
          color: #60a5fa;
        }
        .html-content blockquote {
          border-left: 4px solid #6b7280;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #9ca3af;
        }
        .html-content code {
          background-color: #374151;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          color: #f3f4f6;
        }
        .html-content pre {
          background-color: #1f2937;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .html-content pre code {
          background-color: transparent;
          padding: 0;
        }
        .html-content hr {
          border: none;
          border-top: 1px solid #4b5563;
          margin: 2rem 0;
        }
        .html-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .html-content th,
        .html-content td {
          border: 1px solid #4b5563;
          padding: 0.5rem;
          text-align: left;
        }
        .html-content th {
          background-color: #374151;
          font-weight: 600;
          color: white;
        }
        .html-content td {
          color: #d1d5db;
        }
        
        /* Стили для интерактивных элементов */
        .character-card {
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 4px;
          padding: 2px 4px;
        }
        .character-card:hover {
          background-color: rgba(59, 130, 246, 0.2);
          transform: translateY(-1px);
        }
        .artifact-info {
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 4px;
          padding: 2px 4px;
        }
        .artifact-info:hover {
          background-color: rgba(34, 197, 94, 0.2);
          transform: translateY(-1px);
        }
        .weapon-info {
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 4px;
          padding: 2px 4px;
        }
        .weapon-info:hover {
          background-color: rgba(168, 85, 247, 0.2);
          transform: translateY(-1px);
        }
        .element-badge {
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 4px;
          padding: 2px 4px;
        }
        .element-badge:hover {
          background-color: rgba(251, 191, 36, 0.2);
          transform: translateY(-1px);
        }
        
        /* Цветные элементы */
        .html-content [data-element="pyro"] {
          color: #ef4444;
          font-weight: 600;
        }
        .html-content [data-element="hydro"] {
          color: #3b82f6;
          font-weight: 600;
        }
        .html-content [data-element="electro"] {
          color: #a21caf;
          font-weight: 600;
        }
        .html-content [data-element="cryo"] {
          color: #06b6d4;
          font-weight: 600;
        }
        .html-content [data-element="anemo"] {
          color: #22c55e;
          font-weight: 600;
        }
        .html-content [data-element="geo"] {
          color: #eab308;
          font-weight: 600;
        }
        .html-content [data-element="dendro"] {
          color: #10b981;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
