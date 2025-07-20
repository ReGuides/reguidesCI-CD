'use client';

import React, { useState, useRef } from 'react';

interface TextFormattingToolbarProps {
  onInsert: (text: string) => void;
}

const COLORS = [
  { name: 'Пиро', value: 'pyro', icon: '🔥' },
  { name: 'Гидро', value: 'hydro', icon: '💧' },
  { name: 'Электро', value: 'electro', icon: '⚡' },
  { name: 'Крио', value: 'cryo', icon: '❄️' },
  { name: 'Анемо', value: 'anemo', icon: '🌪️' },
  { name: 'Гео', value: 'geo', icon: '🪨' },
  { name: 'Дендро', value: 'dendro', icon: '🌱' },
  { name: 'Красный', value: 'red', icon: '🔴' },
  { name: 'Синий', value: 'blue', icon: '🔵' },
  { name: 'Зелёный', value: 'green', icon: '🟢' },
  { name: 'Жёлтый', value: 'yellow', icon: '🟡' },
  { name: 'Оранжевый', value: 'orange', icon: '🟠' },
  { name: 'Фиолетовый', value: 'purple', icon: '🟣' },
  { name: 'Розовый', value: 'pink', icon: '🩷' },
];

const TextFormattingToolbar: React.FC<TextFormattingToolbarProps> = ({ onInsert }) => {
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие dropdown при клике вне его
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowColorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBold = () => {
    onInsert('**жирный текст**');
  };

  const handleColor = (color: string) => {
    onInsert(`[${color}:текст]`);
    setShowColorDropdown(false);
  };

  const handleLink = () => {
    if (linkText && linkUrl) {
      onInsert(`[${linkText}](${linkUrl})`);
      setLinkText('');
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
      {/* Кнопка жирного текста */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleBold();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded text-sm font-bold transition-colors"
        title="Жирный текст"
      >
        B
      </button>

      {/* Dropdown для цветов */}
      <div className="relative" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowColorDropdown(!showColorDropdown);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded text-sm transition-colors flex items-center gap-1"
          title="Цветной текст"
        >
          🎨 Цвет
          <span className="text-xs">▼</span>
        </button>
        
        {showColorDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-neutral-800 border border-neutral-600 rounded-lg shadow-lg z-50 min-w-48" onClick={(e) => e.stopPropagation()}>
            <div className="p-2">
              <div className="text-xs text-gray-400 mb-2 px-2">Элементы Genshin Impact:</div>
              <div className="grid grid-cols-2 gap-1 mb-2">
                {COLORS.slice(0, 7).map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColor(color.value);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-2 py-1 text-sm text-white hover:bg-neutral-700 rounded transition-colors text-left"
                  >
                    <span>{color.icon}</span>
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-400 mb-2 px-2">Дополнительные цвета:</div>
              <div className="grid grid-cols-2 gap-1">
                {COLORS.slice(7).map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColor(color.value);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-2 py-1 text-sm text-white hover:bg-neutral-700 rounded transition-colors text-left"
                  >
                    <span>{color.icon}</span>
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Кнопка ссылки */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowLinkModal(true);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded text-sm transition-colors"
        title="Вставить ссылку"
      >
        🔗 Ссылка
      </button>

      {/* Модальное окно для ссылки */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
          <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Вставить ссылку</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Текст ссылки
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  placeholder="Текст ссылки"
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowLinkModal(false);
                  setLinkText('');
                  setLinkUrl('');
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-white transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLink();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                disabled={!linkText || !linkUrl}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 disabled:cursor-not-allowed rounded text-white transition-colors"
              >
                Вставить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextFormattingToolbar; 