'use client';

import { useState, useRef, useEffect } from 'react';
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
  Type
} from 'lucide-react';
import { Button } from './button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const colorOptions = [
  { name: 'Красный', value: '#ef4444', class: 'text-red-500' },
  { name: 'Оранжевый', value: '#f97316', class: 'text-orange-500' },
  { name: 'Желтый', value: '#eab308', class: 'text-yellow-500' },
  { name: 'Зеленый', value: '#22c55e', class: 'text-green-500' },
  { name: 'Синий', value: '#3b82f6', class: 'text-blue-500' },
  { name: 'Фиолетовый', value: '#8b5cf6', class: 'text-purple-500' },
  { name: 'Розовый', value: '#ec4899', class: 'text-pink-500' },
  { name: 'Белый', value: '#ffffff', class: 'text-white' },
];

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
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
  };

  const formatText = (tag: string) => {
    const tagMap: Record<string, { before: string; after: string }> = {
      bold: { before: '<strong>', after: '</strong>' },
      italic: { before: '<em>', after: '</em>' },
      underline: { before: '<u>', after: '</u>' },
      strikethrough: { before: '<s>', after: '</s>' },
      quote: { before: '<blockquote>', after: '</blockquote>' },
      list: { before: '<ul><li>', after: '</li></ul>' },
      orderedList: { before: '<ol><li>', after: '</li></ol>' },
      divider: { before: '<hr>', after: '' },
    };

    const format = tagMap[tag];
    if (format) {
      insertText(format.before, format.after);
    }
  };

  const setColor = (color: string) => {
    insertText(`<span style="color: ${color}">`, '</span>');
    setShowColorPicker(false);
  };

  const setFontSize = (size: string) => {
    insertText(`<span style="font-size: ${size}px">`, '</span>');
    setShowFontSize(false);
  };

  const alignText = (alignment: string) => {
    insertText(`<div style="text-align: ${alignment}">`, '</div>');
  };

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
  }, [value]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Панель инструментов */}
      <div className="flex flex-wrap gap-2 p-3 bg-neutral-700 rounded-lg border border-neutral-600">
        {/* Форматирование текста */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('bold')}
            className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
            title="Жирный (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('italic')}
            className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
            title="Курсив (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('underline')}
            className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
            title="Подчеркнутый (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('strikethrough')}
            className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
            title="Зачеркнутый"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
        </div>

        {/* Выравнивание */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alignText('left')}
            className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
            title="Выровнять по левому краю"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alignText('center')}
            className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
            title="Выровнять по центру"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alignText('right')}
            className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
            title="Выровнять по правому краю"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Списки и цитаты */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('list')}
            className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
            title="Маркированный список"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('orderedList')}
            className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
            title="Нумерованный список"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('quote')}
            className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
            title="Цитата"
          >
            <Quote className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => formatText('divider')}
            className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
            title="Разделительная линия"
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>

        {/* Цвет текста */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
            title="Цвет текста"
          >
            <Palette className="w-4 h-4" />
          </Button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-neutral-800 border border-neutral-600 rounded-lg p-2 z-10 shadow-lg">
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setColor(color.value)}
                    className={`w-8 h-8 rounded border-2 border-neutral-600 hover:border-white transition-colors ${color.class}`}
                    style={{ backgroundColor: color.value === '#ffffff' ? '#374151' : 'transparent' }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Размер шрифта */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFontSize(!showFontSize)}
            className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
            title="Размер шрифта"
          >
            <Type className="w-4 h-4" />
          </Button>
          
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 bg-neutral-800 border border-neutral-600 rounded-lg p-2 z-10 shadow-lg">
              <div className="grid grid-cols-2 gap-1">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className="px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded text-white transition-colors"
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Текстовое поле */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[300px] rounded-md border border-neutral-600 bg-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono"
      />

      {/* Подсказки */}
      <div className="text-xs text-gray-400 space-y-1">
        <p><strong>Горячие клавиши:</strong> Ctrl+B (жирный), Ctrl+I (курсив), Ctrl+U (подчеркнутый)</p>
        <p><strong>Подсказка:</strong> Выделите текст и нажмите кнопку форматирования, или вставьте тег в нужное место</p>
      </div>
    </div>
  );
}
