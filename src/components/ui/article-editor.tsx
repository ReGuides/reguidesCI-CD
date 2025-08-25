'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Minus,
  Palette,
  Type,
  Heading1,
  Heading2,
  Link,
  Code,
  Table,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from './button';
import EditorHelp from './editor-help';
import GameToolbar from './game-toolbar';

interface ArticleEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showGameToolbar?: boolean;
}

const colorOptions = [
  { name: 'Красный', value: '#ef4444' },
  { name: 'Оранжевый', value: '#f97316' },
  { name: 'Желтый', value: '#eab308' },
  { name: 'Зеленый', value: '#22c55e' },
  { name: 'Синий', value: '#3b82f6' },
  { name: 'Фиолетовый', value: '#8b5cf6' },
  { name: 'Розовый', value: '#ec4899' },
  { name: 'Белый', value: '#ffffff' },
];

export default function ArticleEditor({ 
  value, 
  onChange, 
  placeholder, 
  className, 
  showGameToolbar = false 
}: ArticleEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);

  // Инициализируем обработчик кликов для игровых элементов
  useEffect(() => {
    const handleGameElementClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const gameElement = target.closest('[data-modal-type]') as HTMLElement;
      
      if (gameElement) {
        e.preventDefault();
        e.stopPropagation();
        
        const modalType = gameElement.dataset.modalType;
        const modalId = gameElement.dataset.modalId;
        
        if (modalType && modalId) {
          console.log(`Opening modal for ${modalType} with id: ${modalId}`);
          // Отправляем событие для открытия модального окна
          window.dispatchEvent(new CustomEvent('openModal', { 
            detail: { type: modalType, id: modalId } 
          }));
        }
      }
    };

    // Добавляем обработчик кликов на документ
    document.addEventListener('click', handleGameElementClick, true);

    return () => {
      document.removeEventListener('click', handleGameElementClick, true);
    };
  }, []);

  const insertText = useCallback((before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Устанавливаем курсор после вставленного текста
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + before.length + selectedText.length + after.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  }, [value, onChange]);

  const formatText = useCallback((tag: string) => {
    const tagMap: Record<string, { before: string; after: string }> = {
      bold: { before: '<strong>', after: '</strong>' },
      italic: { before: '<em>', after: '</em>' },
      underline: { before: '<u>', after: '</u>' },
      strikethrough: { before: '<s>', after: '</s>' },
      quote: { before: '<blockquote>', after: '</blockquote>' },
      list: { before: '<ul><li>', after: '</li></ul>' },
      orderedList: { before: '<ol><li>', after: '</li></ol>' },
      divider: { before: '<hr>', after: '' },
      heading1: { before: '<h1>', after: '</h1>' },
      heading2: { before: '<h2>', after: '</h2>' },
      code: { before: '<code>', after: '</code>' },
      link: { before: '<a href="">', after: '</a>' },
      table: { before: '<table><tr><td>', after: '</td></tr></table>' },
      image: { before: '<img src="" alt="" />', after: '' },
    };

    const format = tagMap[tag];
    if (format) {
      insertText(format.before, format.after);
    }
  }, [insertText]);

  const setColor = useCallback((color: string) => {
    insertText(`<span style="color: ${color}">`, '</span>');
    setShowColorPicker(false);
  }, [insertText]);

  const setFontSize = useCallback((size: string) => {
    insertText(`<span style="font-size: ${size}px">`, '</span>');
    setShowFontSize(false);
  }, [insertText]);

  const alignText = useCallback((alignment: string) => {
    insertText(`<div style="text-align: ${alignment}">`, '</div>');
  }, [insertText]);

  const fontSizes = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48'];

  // Обработка горячих клавиш
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            formatText('bold');
            break;
          case 'i':
            e.preventDefault();
            formatText('italic');
            break;
          case 'u':
            e.preventDefault();
            formatText('underline');
            break;
        }
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown);
      return () => textarea.removeEventListener('keydown', handleKeyDown);
    }
  }, [value, formatText]);

  // Закрытие выпадающих списков при клике вне их области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.color-picker') && !target.closest('.font-size-picker')) {
        setShowColorPicker(false);
        setShowFontSize(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Обработчики для игровой панели
  const handleInsertCharacter = useCallback((character: { _id: string; name: string; image: string; element: string; rarity: number }) => {
    const html = `<span class="character-card cursor-pointer hover:bg-blue-500/20 transition-colors rounded px-2 py-1" 
      data-character-id="${character._id}" 
      data-modal-type="character"
      data-modal-id="${character._id}"
      style="border: 1px solid #3b82f6; display: inline-flex; align-items: center; gap: 4px; text-decoration: underline; text-decoration-color: #3b82f6; text-decoration-thickness: 1px;">
             <img src="${character.image}" alt="${character.name}" class="w-4 h-4 rounded-full object-cover" onerror="this.style.opacity='0.2';" />
      <strong>${character.name}</strong>
      <span class="text-xs text-gray-400">${character.element} ${character.rarity}⭐</span>

    </span>`;
    insertText(html, '');
  }, [insertText]);

  const handleInsertTalent = useCallback((talent: { _id: string; name: string; type: string; description: string }) => {
    const html = `<span class="talent-info cursor-pointer hover:bg-yellow-500/20 transition-colors rounded px-2 py-1" 
      data-talent-id="${talent._id}" 
      data-modal-type="talent"
      data-modal-id="${talent._id}"
      style="border: 1px solid #eab308; display: inline-flex; align-items: center; gap: 4px; text-decoration: underline; text-decoration-color: #eab308; text-decoration-thickness: 1px;">
      <span class="talent-icon">⭐</span> 
      <strong>${talent.name}</strong> 
      <span class="text-xs text-gray-400">(${talent.type})</span>

    </span>`;
    insertText(html, '');
  }, [insertText]);

  const handleInsertArtifact = useCallback((artifact: { _id: string; name: string; rarity: number; bonus: string }) => {
    const html = `<span class="artifact-info cursor-pointer hover:bg-purple-500/20 transition-colors rounded px-2 py-1" 
      data-artifact-id="${artifact._id}" 
      data-modal-type="artifact"
      data-modal-id="${artifact._id}"
      style="border: 1px solid #a855f7; display: inline-flex; align-items: center; gap: 4px; text-decoration: underline; text-decoration-color: #a855f7; text-decoration-thickness: 1px;">
      <span class="artifact-icon">💎</span> 
      <strong>${artifact.name}</strong> 
      <span class="text-xs text-gray-400">${artifact.rarity}⭐ • ${artifact.bonus}</span>

    </span>`;
    insertText(html, '');
  }, [insertText]);

  const handleInsertWeapon = useCallback((weapon: { _id: string; name: string; type: string; rarity: number; passive: string }) => {
    const html = `<span class="weapon-info cursor-pointer hover:bg-orange-500/20 transition-colors rounded px-2 py-1" 
      data-weapon-id="${weapon._id}" 
      data-modal-type="weapon"
      data-modal-id="${weapon._id}"
      style="border: 1px solid #f97316; display: inline-flex; align-items: center; gap: 4px; text-decoration: underline; text-decoration-color: #f97316; text-decoration-thickness: 1px;">
      <span class="weapon-icon">⚔️</span> 
      <strong>${weapon.name}</strong> 
      <span class="text-xs text-gray-400">${weapon.type} ${weapon.rarity}⭐</span>

    </span>`;
    insertText(html, '');
  }, [insertText]);

  const handleInsertElement = useCallback((element: { name: string; value: string; color: string; icon: string }) => {
    const html = `<span class="element-badge" style="color: ${element.color}; border: 1px solid ${element.color}; display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; background: ${element.color}20;">
      ${element.icon} <strong>${element.name}</strong>
    </span>`;
    insertText(html, '');
  }, [insertText]);

  return (
    <div className={`space-y-3 ${className}`} onSubmit={(e) => e.preventDefault()}>
      {/* Игровая панель для статей */}
      {showGameToolbar && (
        <GameToolbar
          onInsertCharacter={handleInsertCharacter}
          onInsertTalent={handleInsertTalent}
          onInsertArtifact={handleInsertArtifact}
          onInsertWeapon={handleInsertWeapon}
          onInsertElement={handleInsertElement}
        />
      )}

      {/* Панель инструментов */}
      <div className="flex flex-wrap gap-2 p-3 bg-neutral-700 rounded-lg border border-neutral-600">
        {/* Форматирование текста */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('bold')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Жирный (Ctrl+B)"
          >
            <Bold className="w-3 h-3 mr-1" />
            B
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('italic')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Курсив (Ctrl+I)"
          >
            <Italic className="w-3 h-3 mr-1" />
            I
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('underline')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Подчеркнутый (Ctrl+U)"
          >
            <Underline className="w-3 h-3 mr-1" />
            U
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('strikethrough')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Зачеркнутый"
          >
            <Strikethrough className="w-3 h-3 mr-1" />
            S
          </Button>
        </div>

        {/* Выравнивание */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alignText('left')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Выровнять по левому краю"
          >
            <AlignLeft className="w-3 h-3 mr-1" />
            ←
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alignText('center')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Выровнять по центру"
          >
            <AlignCenter className="w-3 h-3 mr-1" />
            ↔
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alignText('right')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Выровнять по правому краю"
          >
            <AlignRight className="w-3 h-3 mr-1" />
            →
          </Button>
        </div>

        {/* Списки и цитаты */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('list')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Маркированный список"
          >
            <List className="w-3 h-3 mr-1" />
            •
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('orderedList')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Нумерованный список"
          >
            <ListOrdered className="w-3 h-3 mr-1" />
            1.
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('quote')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Цитата"
          >
            <Quote className="w-3 h-3 mr-1" />
            &quot;
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('divider')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Разделительная линия"
          >
            <Minus className="w-3 h-3 mr-1" />
            ─
          </Button>
        </div>

        {/* Заголовки и код */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('heading1')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Заголовок 1"
          >
            <Heading1 className="w-3 h-3 mr-1" />
            H1
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('heading2')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Заголовок 2"
          >
            <Heading2 className="w-3 h-3 mr-1" />
            H2
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('code')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Код"
          >
            <Code className="w-3 h-3 mr-1" />
            {'</>'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('link')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Ссылка"
          >
            <Link className="w-3 h-3 mr-1" />
            🔗
          </Button>
        </div>

        {/* Таблица и изображение */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('table')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Таблица"
          >
            <Table className="w-3 h-3 mr-1" />
            ⊞
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('image')}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Изображение"
          >
            <ImageIcon className="w-3 h-3 mr-1" />
            🖼️
          </Button>
        </div>

        {/* Цвет текста */}
        <div className="relative color-picker">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Цвет текста"
          >
            <Palette className="w-3 h-3 mr-1" />
            🎨
          </Button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 bg-neutral-800 border border-neutral-600 rounded-lg p-3 z-20 shadow-xl min-w-[200px] max-w-[280px]">
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setColor(color.value)}
                    className="w-10 h-10 rounded-lg border-2 border-neutral-600 hover:border-white hover:scale-110 transition-all duration-200"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-neutral-600">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(false)}
                  className="w-full px-2 py-1 text-xs text-gray-400 hover:text-white bg-neutral-700 hover:bg-neutral-600 rounded transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Размер шрифта */}
        <div className="relative font-size-picker">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFontSize(!showFontSize)}
            className="h-8 px-2 border-neutral-600 hover:bg-neutral-600"
            title="Размер шрифта"
          >
            <Type className="w-3 h-3 mr-1" />
            Aa
          </Button>
          
          {showFontSize && (
            <div className="absolute top-full left-0 mt-2 bg-neutral-800 border border-neutral-600 rounded-lg p-3 z-20 shadow-xl min-w-[150px] max-w-[200px]">
              <div className="grid grid-cols-2 gap-2">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className="px-3 py-2 text-sm bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-all duration-200 hover:scale-105"
                  >
                    {size}px
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-neutral-600">
                <button
                  type="button"
                  onClick={() => setShowFontSize(false)}
                  className="w-full px-2 py-1 text-xs text-gray-400 hover:text-white bg-neutral-700 hover:bg-neutral-600 rounded transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Кнопка помощи */}
        <EditorHelp />
      </div>

      {/* Текстовое поле */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          e.preventDefault();
          onChange(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
          }
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
          }
        }}
        placeholder={placeholder}
        className="w-full min-h-[400px] rounded-md border border-neutral-600 bg-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono"
      />

      {/* Подсказки */}
      <div className="text-xs text-gray-400 space-y-1">
        <p><strong>Горячие клавиши:</strong> Ctrl+B (жирный), Ctrl+I (курсив), Ctrl+U (подчеркнутый)</p>
        <p><strong>Подсказка:</strong> Выделите текст и нажмите кнопку форматирования, или вставьте тег в нужное место</p>
        <p><strong>Доступные теги:</strong> Заголовки, списки, цитаты, ссылки, код, таблицы, изображения, разделители</p>
        {showGameToolbar && (
          <p><strong>Игровые элементы:</strong> Используйте панель выше для вставки персонажей, талантов, артефактов, оружия и элементов</p>
        )}
        <p><strong>Наведение:</strong> Наведите курсор на кнопку, чтобы увидеть подсказку о её функции</p>
      </div>

      {/* CSS стили для игровых элементов */}
      <style jsx>{`
        .character-card:hover {
          background-color: rgba(59, 130, 246, 0.2);
        }
        .talent-info:hover {
          background-color: rgba(234, 179, 8, 0.2);
        }
        .artifact-info:hover {
          background-color: rgba(168, 85, 247, 0.2);
        }
        .weapon-info:hover {
          background-color: rgba(249, 115, 22, 0.2);
        }
        .element-badge {
          transition: all 0.2s ease;
        }
        .element-badge:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
