'use client';

import React from 'react';

interface Talent {
  name: string;
  description: string;
  type: 'Normal Attack' | 'Elemental Skill' | 'Elemental Burst';
}

interface ElementTalentsProps {
  element: string;
  talents: { [element: string]: Talent[] };
}

const elementNames: { [key: string]: string } = {
  anemo: 'Анемо',
  geo: 'Гео', 
  electro: 'Электро',
  dendro: 'Дендро'
};

const elementColors: { [key: string]: string } = {
  anemo: '#22c55e',
  geo: '#eab308',
  electro: '#a21caf', 
  dendro: '#10b981'
};

export default function ElementTalents({ element, talents }: ElementTalentsProps) {
  const currentTalents = talents[element] || [];
  const elementColor = elementColors[element] || '#6b7280';
  const elementName = elementNames[element] || element;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: elementColor }}
        >
          {element === 'anemo' ? '💨' : element === 'geo' ? '🪨' : element === 'electro' ? '⚡' : '🌱'}
        </div>
        <h3 className="text-xl font-bold text-white">Таланты {elementName}</h3>
      </div>

      <div className="grid gap-4">
        {currentTalents.map((talent, index) => (
          <div key={index} className="bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span 
                className="px-2 py-1 rounded text-xs font-semibold text-white"
                style={{ backgroundColor: elementColor }}
              >
                {talent.type === 'Normal Attack' ? 'Обычная атака' :
                 talent.type === 'Elemental Skill' ? 'Элементальный навык' :
                 'Элементальный взрыв'}
              </span>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">{talent.name}</h4>
            <p className="text-gray-300 leading-relaxed">{talent.description}</p>
          </div>
        ))}
      </div>

      {currentTalents.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>Таланты для элемента {elementName} пока не добавлены</p>
        </div>
      )}
    </div>
  );
}
