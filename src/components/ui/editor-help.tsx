'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from './button';

export default function EditorHelp() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowHelp(true)}
        className="h-8 w-8 p-0 border-neutral-600 hover:bg-neutral-600"
        title="Помощь по редактору"
      >
        <HelpCircle className="w-4 h-4" />
      </Button>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative bg-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-700">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Справка по редактору</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-white text-2xl flex-shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <h3 className="text-white font-semibold mb-2">Основное форматирование:</h3>
                  <ul className="space-y-1 ml-4">
                    <li><strong>B</strong> - Жирный текст (Ctrl+B)</li>
                    <li><strong>I</strong> - Курсив (Ctrl+I)</li>
                    <li><strong>U</strong> - Подчеркнутый (Ctrl+U)</li>
                    <li><strong>S</strong> - Зачеркнутый</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">Выравнивание:</h3>
                  <ul className="space-y-1 ml-4">
                    <li><strong>←</strong> - По левому краю</li>
                    <li><strong>↔</strong> - По центру</li>
                    <li><strong>→</strong> - По правому краю</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">Структура:</h3>
                  <ul className="space-y-1 ml-4">
                    <li><strong>•</strong> - Маркированный список</li>
                    <li><strong>1.</strong> - Нумерованный список</li>
                                         <li><strong>&quot;</strong> - Цитата</li>
                    <li><strong>─</strong> - Разделительная линия</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">Заголовки и код:</h3>
                  <ul className="space-y-1 ml-4">
                    <li><strong>H1</strong> - Заголовок 1 уровня</li>
                    <li><strong>H2</strong> - Заголовок 2 уровня</li>
                    <li><strong>{'</>'}</strong> - Код</li>
                    <li><strong>🔗</strong> - Ссылка</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">Дополнительно:</h3>
                  <ul className="space-y-1 ml-4">
                    <li><strong>⊞</strong> - Таблица</li>
                    <li><strong>🖼️</strong> - Изображение</li>
                    <li><strong>🎨</strong> - Цвет текста</li>
                    <li><strong>Aa</strong> - Размер шрифта</li>
                  </ul>
                </div>

                <div className="bg-neutral-700 p-3 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">💡 Полезные советы:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Выделите текст перед нажатием кнопки форматирования</li>
                    <li>• Используйте горячие клавиши для быстрого доступа</li>
                    <li>• Все изменения применяются мгновенно</li>
                    <li>• HTML код можно редактировать вручную</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
