'use client';

import React from 'react';

interface ElementSwitcherProps {
  currentElement: string;
  onElementChange: (element: string) => void;
}

const elements = [
  { value: 'anemo', name: 'Анемо', icon: '💨', color: '#22c55e' },
  { value: 'geo', name: 'Гео', icon: '🪨', color: '#eab308' },
  { value: 'electro', name: 'Электро', icon: '⚡', color: '#a21caf' },
  { value: 'dendro', name: 'Дендро', icon: '🌱', color: '#10b981' }
];

export default function ElementSwitcher({ currentElement, onElementChange }: ElementSwitcherProps) {
  return (
    <div className="bg-neutral-800 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">Выберите элемент</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {elements.map((element) => (
          <button
            key={element.value}
            onClick={() => onElementChange(element.value)}
            className={`
              flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200
              ${currentElement === element.value
                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                : 'border-neutral-600 bg-neutral-700 hover:border-neutral-500 text-gray-300 hover:text-white'
              }
            `}
            style={{
              borderColor: currentElement === element.value ? element.color : undefined,
              backgroundColor: currentElement === element.value ? `${element.color}20` : undefined,
              color: currentElement === element.value ? element.color : undefined
            }}
          >
            <span className="text-2xl mb-1">{element.icon}</span>
            <span className="text-sm font-medium">{element.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
