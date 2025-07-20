'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export default function MarkdownHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const markdownExamples = [
    {
      title: 'Заголовки',
      examples: [
        { syntax: '# Заголовок 1', description: 'Заголовок первого уровня' },
        { syntax: '## Заголовок 2', description: 'Заголовок второго уровня' },
        { syntax: '### Заголовок 3', description: 'Заголовок третьего уровня' },
      ]
    },
    {
      title: 'Форматирование текста',
      examples: [
        { syntax: '**жирный текст**', description: 'Жирный текст' },
        { syntax: '*курсив*', description: 'Курсив' },
        { syntax: '~~зачеркнутый~~', description: 'Зачеркнутый текст' },
        { syntax: '`код`', description: 'Встроенный код' },
      ]
    },
    {
      title: 'Списки',
      examples: [
        { syntax: '- Элемент списка', description: 'Маркированный список' },
        { syntax: '1. Элемент списка', description: 'Нумерованный список' },
      ]
    },
    {
      title: 'Ссылки и изображения',
      examples: [
        { syntax: '[текст ссылки](url)', description: 'Ссылка' },
        { syntax: '![alt текст](url)', description: 'Изображение' },
      ]
    },
    {
      title: 'Блоки кода',
      examples: [
        { syntax: '```javascript\nкод\n```', description: 'Блок кода с подсветкой' },
      ]
    },
    {
      title: 'Цитаты',
      examples: [
        { syntax: '> Цитата', description: 'Блок цитаты' },
      ]
    },
    {
      title: 'Таблицы',
      examples: [
        { syntax: '| Заголовок | Заголовок |\n|-----------|-----------|\n| Ячейка | Ячейка |', description: 'Таблица' },
      ]
    },
    {
      title: 'Разделители',
      examples: [
        { syntax: '---', description: 'Горизонтальная линия' },
      ]
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
        title="Справка по Markdown"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-neutral-700">
              <h2 className="text-xl font-bold text-white">Справка по Markdown</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {markdownExamples.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
                      {section.title}
                    </h3>
                    <div className="space-y-2">
                      {section.examples.map((example, exIndex) => (
                        <div key={exIndex} className="space-y-1">
                          <code className="block bg-neutral-800 text-accent p-2 rounded text-sm">
                            {example.syntax}
                          </code>
                          <p className="text-sm text-neutral-400">
                            {example.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-neutral-800 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Советы:</h4>
                <ul className="text-sm text-neutral-300 space-y-1">
                  <li>• Выделите текст и нажмите кнопку форматирования для обертывания</li>
                  <li>• Используйте Tab для отступов в списках</li>
                  <li>• Переключайтесь между режимами редактирования и просмотра</li>
                  <li>• Поддерживается GitHub Flavored Markdown (GFM)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 