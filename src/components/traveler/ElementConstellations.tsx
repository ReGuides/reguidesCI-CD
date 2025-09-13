'use client';

import React from 'react';

interface Constellation {
  name: string;
  description: string;
  level: number;
}

interface ElementConstellationsProps {
  element: string;
  constellations: { [element: string]: Constellation[] };
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

export default function ElementConstellations({ element, constellations }: ElementConstellationsProps) {
  const currentConstellations = constellations[element] || [];
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
        <h3 className="text-xl font-bold text-white">Созвездия {elementName}</h3>
      </div>

      <div className="grid gap-4">
        {currentConstellations.map((constellation, index) => (
          <div key={index} className="bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: elementColor }}
              >
                {constellation.level}
              </div>
              <h4 className="text-lg font-semibold text-white">{constellation.name}</h4>
            </div>
            <p className="text-gray-300 leading-relaxed">{constellation.description}</p>
          </div>
        ))}
      </div>

      {currentConstellations.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>Созвездия для элемента {elementName} пока не добавлены</p>
        </div>
      )}
    </div>
  );
}
