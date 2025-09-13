'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ElementSwitcher from '@/components/traveler/ElementSwitcher';
import ElementTalents from '@/components/traveler/ElementTalents';
import ElementConstellations from '@/components/traveler/ElementConstellations';
import HtmlContent from '@/components/ui/html-content';

type TabType = 'talents' | 'constellations' | 'builds' | 'teams';

// Данные талантов для каждого элемента
const travelerTalents = {
  anemo: [
    {
      name: 'Обычная атака: Иностранный меч',
      description: 'Выполняет до 5 быстрых атак.',
      type: 'Normal Attack' as const
    },
    {
      name: 'Элементальный навык: Вихрь',
      description: 'Создает вихрь, который втягивает врагов и наносит Анемо урон.',
      type: 'Elemental Skill' as const
    },
    {
      name: 'Элементальный взрыв: Ураган',
      description: 'Создает мощный ураган, который наносит Анемо урон по области.',
      type: 'Elemental Burst' as const
    }
  ],
  geo: [
    {
      name: 'Обычная атака: Иностранный меч',
      description: 'Выполняет до 5 быстрых атак.',
      type: 'Normal Attack' as const
    },
    {
      name: 'Элементальный навык: Звездная ракета',
      description: 'Создает гео-конструкцию, которая наносит Гео урон.',
      type: 'Elemental Skill' as const
    },
    {
      name: 'Элементальный взрыв: Скала',
      description: 'Создает мощную гео-конструкцию, которая наносит Гео урон по области.',
      type: 'Elemental Burst' as const
    }
  ],
  electro: [
    {
      name: 'Обычная атака: Иностранный меч',
      description: 'Выполняет до 5 быстрых атак.',
      type: 'Normal Attack' as const
    },
    {
      name: 'Элементальный навык: Молния',
      description: 'Наносит Электро урон и создает электро-реакции.',
      type: 'Elemental Skill' as const
    },
    {
      name: 'Элементальный взрыв: Гром',
      description: 'Создает мощную молнию, которая наносит Электро урон по области.',
      type: 'Elemental Burst' as const
    }
  ],
  dendro: [
    {
      name: 'Обычная атака: Иностранный меч',
      description: 'Выполняет до 5 быстрых атак.',
      type: 'Normal Attack' as const
    },
    {
      name: 'Элементальный навык: Рост',
      description: 'Создает дендро-конструкцию, которая наносит Дендро урон.',
      type: 'Elemental Skill' as const
    },
    {
      name: 'Элементальный взрыв: Лес',
      description: 'Создает мощную дендро-конструкцию, которая наносит Дендро урон по области.',
      type: 'Elemental Burst' as const
    }
  ]
};

// Данные созвездий для каждого элемента
const travelerConstellations = {
  anemo: [
    {
      name: 'С1: Вихревой поток',
      description: 'Увеличивает радиус действия элементального навыка.',
      level: 1
    },
    {
      name: 'С2: Воздушный поток',
      description: 'Увеличивает урон элементального взрыва.',
      level: 2
    },
    {
      name: 'С3: Ветреный клинок',
      description: 'Увеличивает уровень элементального навыка на 3.',
      level: 3
    },
    {
      name: 'С4: Ураганный клинок',
      description: 'Увеличивает уровень элементального взрыва на 3.',
      level: 4
    },
    {
      name: 'С5: Вихревой клинок',
      description: 'Увеличивает уровень обычной атаки на 3.',
      level: 5
    },
    {
      name: 'С6: Ветреный клинок',
      description: 'Увеличивает урон всех атак на 20%.',
      level: 6
    }
  ],
  geo: [
    {
      name: 'С1: Каменный поток',
      description: 'Увеличивает радиус действия элементального навыка.',
      level: 1
    },
    {
      name: 'С2: Земной поток',
      description: 'Увеличивает урон элементального взрыва.',
      level: 2
    },
    {
      name: 'С3: Каменный клинок',
      description: 'Увеличивает уровень элементального навыка на 3.',
      level: 3
    },
    {
      name: 'С4: Скальный клинок',
      description: 'Увеличивает уровень элементального взрыва на 3.',
      level: 4
    },
    {
      name: 'С5: Каменный клинок',
      description: 'Увеличивает уровень обычной атаки на 3.',
      level: 5
    },
    {
      name: 'С6: Земной клинок',
      description: 'Увеличивает урон всех атак на 20%.',
      level: 6
    }
  ],
  electro: [
    {
      name: 'С1: Молниеносный поток',
      description: 'Увеличивает радиус действия элементального навыка.',
      level: 1
    },
    {
      name: 'С2: Электрический поток',
      description: 'Увеличивает урон элементального взрыва.',
      level: 2
    },
    {
      name: 'С3: Молниеносный клинок',
      description: 'Увеличивает уровень элементального навыка на 3.',
      level: 3
    },
    {
      name: 'С4: Громовой клинок',
      description: 'Увеличивает уровень элементального взрыва на 3.',
      level: 4
    },
    {
      name: 'С5: Молниеносный клинок',
      description: 'Увеличивает уровень обычной атаки на 3.',
      level: 5
    },
    {
      name: 'С6: Электрический клинок',
      description: 'Увеличивает урон всех атак на 20%.',
      level: 6
    }
  ],
  dendro: [
    {
      name: 'С1: Растительный поток',
      description: 'Увеличивает радиус действия элементального навыка.',
      level: 1
    },
    {
      name: 'С2: Лесной поток',
      description: 'Увеличивает урон элементального взрыва.',
      level: 2
    },
    {
      name: 'С3: Растительный клинок',
      description: 'Увеличивает уровень элементального навыка на 3.',
      level: 3
    },
    {
      name: 'С4: Лесной клинок',
      description: 'Увеличивает уровень элементального взрыва на 3.',
      level: 4
    },
    {
      name: 'С5: Растительный клинок',
      description: 'Увеличивает уровень обычной атаки на 3.',
      level: 5
    },
    {
      name: 'С6: Лесной клинок',
      description: 'Увеличивает урон всех атак на 20%.',
      level: 6
    }
  ]
};

export default function TravelerPage() {
  const router = useRouter();
  const [currentElement, setCurrentElement] = useState('anemo');
  const [activeTab, setActiveTab] = useState<TabType>('talents');
  const [isGameplayDescriptionCollapsed, setIsGameplayDescriptionCollapsed] = useState(false);

  const elementColors: { [key: string]: string } = {
    anemo: '#22c55e',
    geo: '#eab308',
    electro: '#a21caf',
    dendro: '#10b981'
  };

  const elementNames: { [key: string]: string } = {
    anemo: 'Анемо',
    geo: 'Гео',
    electro: 'Электро',
    dendro: 'Дендро'
  };

  const handleElementChange = (element: string) => {
    setCurrentElement(element);
  };

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
  };

  const currentElementColor = elementColors[currentElement] || '#6b7280';
  const currentElementName = elementNames[currentElement] || currentElement;

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              ← Назад
            </button>
            <h1 className="text-3xl font-bold">Путешественник</h1>
            <div 
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{ 
                backgroundColor: `${currentElementColor}20`,
                color: currentElementColor,
                border: `1px solid ${currentElementColor}`
              }}
            >
              {currentElementName}
            </div>
          </div>
          <p className="text-gray-300 text-lg">
            Главный персонаж, который может использовать все элементы. Переключайтесь между элементами, 
            чтобы увидеть различные таланты, созвездия и рекомендации.
          </p>
        </div>

        {/* Переключатель элементов */}
        <ElementSwitcher 
          currentElement={currentElement}
          onElementChange={handleElementChange}
        />

        {/* Вкладки */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-neutral-700">
            {[
              { id: 'talents', label: 'Таланты' },
              { id: 'constellations', label: 'Созвездия' },
              { id: 'builds', label: 'Сборки' },
              { id: 'teams', label: 'Команды' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                className={`
                  px-4 py-2 font-medium transition-colors border-b-2
                  ${activeTab === tab.id
                    ? 'text-white border-blue-500'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
                  }
                `}
                style={{
                  borderBottomColor: activeTab === tab.id ? currentElementColor : undefined,
                  color: activeTab === tab.id ? currentElementColor : undefined
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Контент вкладок */}
        <div className="space-y-6">
          {activeTab === 'talents' && (
            <ElementTalents 
              element={currentElement}
              talents={travelerTalents}
            />
          )}

          {activeTab === 'constellations' && (
            <ElementConstellations 
              element={currentElement}
              constellations={travelerConstellations}
            />
          )}

          {activeTab === 'builds' && (
            <div className="text-center py-12 text-gray-400">
              <p>Сборки для элемента {currentElementName} будут добавлены позже</p>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="text-center py-12 text-gray-400">
              <p>Команды для элемента {currentElementName} будут добавлены позже</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
