'use client';

import { useEffect } from 'react';

export function CopyrightConsole() {
  useEffect(() => {
    // Добавляем копирайт в консоль браузера
    console.log(
      '%c© 2025 ReGuides',
      'color: #8b5cf6; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);'
    );
    console.log(
      '%cGenshin Impact Guide - Только нужная информация',
      'color: #a78bfa; font-size: 12px; font-style: italic;'
    );
    console.log(
      '%cВсе права защищены. Копирование запрещено.',
      'color: #c4b5fd; font-size: 10px;'
    );
  }, []);

  return null; // Этот компонент не рендерит ничего видимого
}
