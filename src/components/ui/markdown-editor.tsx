'use client';

import { useState, useRef } from 'react';
import MarkdownRenderer from './markdown-renderer';
import ImageInsertModal from './image-insert-modal';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Table,
  Minus,
  Type,
  Grid3X3,
  HelpCircle,
  Split,
  Eye
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = 'Начните писать вашу статью в формате Markdown...',
  className = '' 
}: MarkdownEditorProps) {
  const [editMode, setEditMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalMode, setImageModalMode] = useState<'single' | 'carousel'>('single');
  const [showHelp, setShowHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (text: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let insertText = text;
    
    // Если есть выделенный текст, обернуть его
    if (selectedText) {
      if (text.includes('**')) {
        insertText = `**${selectedText}**`;
      } else if (text.includes('*')) {
        insertText = `*${selectedText}*`;
      } else if (text.includes('`')) {
        insertText = `\`${selectedText}\``;
      } else if (text.includes('[')) {
        insertText = `[${selectedText}](url)`;
      } else if (text.includes('![')) {
        insertText = `![${selectedText}](url)`;
      } else if (text.includes('>')) {
        insertText = `> ${selectedText}`;
      } else if (text.includes('#')) {
        insertText = `${text} ${selectedText}`;
      } else if (text.includes('-')) {
        insertText = `- ${selectedText}`;
      } else if (text.includes('1.')) {
        insertText = `1. ${selectedText}`;
      }
    }
    
    const newValue = value.substring(0, start) + insertText + value.substring(end);
    onChange(newValue);
    
    // Установить курсор после вставленного текста
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + insertText.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const insertTable = () => {
    const tableTemplate = `| Заголовок 1 | Заголовок 2 | Заголовок 3 |
|-------------|-------------|-------------|
| Ячейка 1    | Ячейка 2    | Ячейка 3    |
| Ячейка 4    | Ячейка 5    | Ячейка 6    |`;
    insertAtCursor(tableTemplate);
  };

  const insertCodeBlock = () => {
    const codeTemplate = `\`\`\`javascript
// Ваш код здесь
console.log('Hello World');
\`\`\``;
    insertAtCursor(codeTemplate);
  };

  const handleImageInsert = (markdown: string) => {
    insertAtCursor(markdown);
  };

  // Обработка горячих клавиш
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertAtCursor('**');
          break;
        case 'i':
          e.preventDefault();
          insertAtCursor('*');
          break;
        case 'k':
          e.preventDefault();
          insertAtCursor('`');
          break;
        case 'l':
          e.preventDefault();
          insertAtCursor('[]()');
          break;
        case '1':
          e.preventDefault();
          insertAtCursor('# ');
          break;
        case '2':
          e.preventDefault();
          insertAtCursor('## ');
          break;
        case '3':
          e.preventDefault();
          insertAtCursor('### ');
          break;
      }
    }
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    onClick, 
    title, 
    disabled = false,
    shortcut
  }: { 
    icon: React.ComponentType<{ className?: string }>; 
    onClick: () => void; 
    title: string; 
    disabled?: boolean;
    shortcut?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={`${title}${shortcut ? ` (${shortcut})` : ''}`}
      className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={`border border-neutral-700 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="p-3 bg-neutral-800 border-b border-neutral-700">
        {/* Первая строка - режимы и справка */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-1">
            {/* Режимы */}
            <button
              type="button"
              onClick={() => {
                // Циклическое переключение между режимами
                if (editMode === 'edit') {
                  setEditMode('split');
                } else if (editMode === 'split') {
                  setEditMode('preview');
                } else {
                  setEditMode('edit');
                }
              }}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
                editMode === 'edit' 
                  ? 'bg-accent text-white' 
                  : editMode === 'split'
                  ? 'bg-blue-600 text-white'
                  : 'bg-green-600 text-white'
              }`}
              title="Переключить режим (Редактировать ↔ Разделенный экран ↔ Предпросмотр)"
            >
                          {editMode === 'edit' && (
              <>
                <Type className="w-4 h-4" />
                Редактировать
              </>
            )}
            {editMode === 'split' && (
              <>
                <Split className="w-4 h-4" />
                Разделенный экран
              </>
            )}
            {editMode === 'preview' && (
              <>
                <Eye className="w-4 h-4" />
                Предпросмотр
              </>
            )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-neutral-400">
              Поддерживается Markdown
            </div>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
              title="Показать справку по Markdown"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Вторая строка - инструменты форматирования */}
        {editMode !== 'preview' && (
          <div className="flex items-center gap-1 flex-wrap mt-2">
            <ToolbarButton 
              icon={Heading1} 
              onClick={() => insertAtCursor('# ')} 
              title="Заголовок 1"
              shortcut="Ctrl+1"
            />
            <ToolbarButton 
              icon={Heading2} 
              onClick={() => insertAtCursor('## ')} 
              title="Заголовок 2"
              shortcut="Ctrl+2"
            />
            <ToolbarButton 
              icon={Heading3} 
              onClick={() => insertAtCursor('### ')} 
              title="Заголовок 3"
              shortcut="Ctrl+3"
            />
            
            <div className="w-px h-6 bg-neutral-600 mx-2" />
            
            <ToolbarButton 
              icon={Bold} 
              onClick={() => insertAtCursor('**')} 
              title="Жирный текст"
              shortcut="Ctrl+B"
            />
            <ToolbarButton 
              icon={Italic} 
              onClick={() => insertAtCursor('*')} 
              title="Курсив"
              shortcut="Ctrl+I"
            />
            <ToolbarButton 
              icon={Code} 
              onClick={() => insertAtCursor('`')} 
              title="Встроенный код"
              shortcut="Ctrl+K"
            />
            
            <div className="w-px h-6 bg-neutral-600 mx-2" />
            
            <ToolbarButton 
              icon={List} 
              onClick={() => insertAtCursor('- ')} 
              title="Маркированный список" 
            />
            <ToolbarButton 
              icon={ListOrdered} 
              onClick={() => insertAtCursor('1. ')} 
              title="Нумерованный список" 
            />
            
            <div className="w-px h-6 bg-neutral-600 mx-2" />
            
            <ToolbarButton 
              icon={Link} 
              onClick={() => insertAtCursor('[]()')} 
              title="Ссылка"
              shortcut="Ctrl+L"
            />
            <ToolbarButton 
              icon={Image} 
              onClick={() => {
                setImageModalMode('single');
                setIsImageModalOpen(true);
              }} 
              title="Вставить изображение" 
            />
            <ToolbarButton 
              icon={Grid3X3} 
              onClick={() => {
                setImageModalMode('carousel');
                setIsImageModalOpen(true);
              }} 
              title="Карусель изображений" 
            />
            <ToolbarButton 
              icon={Quote} 
              onClick={() => insertAtCursor('> ')} 
              title="Цитата" 
            />
            <ToolbarButton 
              icon={Table} 
              onClick={insertTable} 
              title="Таблица" 
            />
            <ToolbarButton 
              icon={Code} 
              onClick={insertCodeBlock} 
              title="Блок кода" 
            />
            <ToolbarButton 
              icon={Minus} 
              onClick={() => insertAtCursor('\n---\n')} 
              title="Горизонтальная линия" 
            />
          </div>
        )}
        {/* Справка по Markdown */}
        {showHelp && (
          <div className="mt-2 p-4 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-300 max-w-xl">
            <h3 className="text-white font-semibold mb-3">Справка по Markdown</h3>
            <div className="space-y-2 text-xs">
              <div><strong>Заголовки:</strong> # H1, ## H2, ### H3</div>
              <div><strong>Форматирование:</strong> **жирный**, *курсив*, `код`</div>
              <div><strong>Списки:</strong> - маркированный, 1. нумерованный</div>
              <div><strong>Ссылки:</strong> [текст](url)</div>
              <div><strong>Изображения:</strong> ![alt](url)</div>
              <div><strong>Цитаты:</strong> &gt; текст</div>
              <div><strong>Код:</strong> ```язык код```</div>
              <div><strong>Таблицы:</strong> | столбец | столбец |</div>
            </div>
          </div>
        )}
      </div>

      {/* Editor/Preview */}
      {editMode === 'edit' && (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-96 p-4 bg-neutral-900 text-white placeholder-neutral-500 resize-none focus:outline-none focus:ring-0"
            style={{ fontFamily: 'monospace' }}
          />
        </div>
      )}

      {editMode === 'preview' && (
        <div className="h-96 overflow-y-auto p-4 bg-neutral-900">
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-neutral-500 italic">Нет содержимого для предварительного просмотра</p>
          )}
        </div>
      )}

      {editMode === 'split' && (
        <div className="flex h-96">
          <div className="w-1/2 border-r border-neutral-700">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full h-full p-4 bg-neutral-900 text-white placeholder-neutral-500 resize-none focus:outline-none focus:ring-0"
              style={{ fontFamily: 'monospace' }}
            />
          </div>
          <div className="w-1/2 overflow-y-auto p-4 bg-neutral-900">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-neutral-500 italic">Нет содержимого для предварительного просмотра</p>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно для вставки изображений */}
      <ImageInsertModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={handleImageInsert}
        initialMode={imageModalMode}
      />
    </div>
  );
} 