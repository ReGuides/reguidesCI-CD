'use client';

import { useState } from 'react';
import AnalyticsStatsImproved from '@/components/admin/AnalyticsStatsImproved';
import AnalyticsReset from '@/components/admin/AnalyticsReset';
import { BarChart3, Trash2, Settings } from 'lucide-react';

export default function ImprovedAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Улучшенная аналитика</h1>
          <p className="text-gray-400">Правильный подсчет уникальных пользователей и управление данными</p>
        </div>
      </div>

      {/* Табы */}
      <div className="space-y-6">
        <div className="flex space-x-1 bg-neutral-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'stats'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Статистика
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'reset'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Сброс данных
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            Настройки
          </button>
        </div>

        {/* Контент табов */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <AnalyticsStatsImproved />
          </div>
        )}

        {activeTab === 'reset' && (
          <div className="space-y-6">
            <AnalyticsReset />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Настройки аналитики</h3>
              <div className="space-y-4">
                <div className="bg-neutral-700 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-2">API Endpoints</h4>
                  <div className="space-y-2 text-sm text-neutral-300">
                    <div><code className="bg-neutral-600 px-2 py-1 rounded">/api/analytics/track-improved</code> - Улучшенное отслеживание</div>
                    <div><code className="bg-neutral-600 px-2 py-1 rounded">/api/analytics/stats-improved</code> - Улучшенная статистика</div>
                    <div><code className="bg-neutral-600 px-2 py-1 rounded">/api/analytics/reset</code> - Сброс данных</div>
                  </div>
                </div>
                
                <div className="bg-neutral-700 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-2">Модели данных</h4>
                  <div className="space-y-2 text-sm text-neutral-300">
                    <div><code className="bg-neutral-600 px-2 py-1 rounded">Analytics</code> - Отдельные просмотры страниц</div>
                    <div><code className="bg-neutral-600 px-2 py-1 rounded">UserSession</code> - Сессии пользователей</div>
                  </div>
                </div>

                <div className="bg-neutral-700 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-2">Особенности</h4>
                  <ul className="space-y-1 text-sm text-neutral-300">
                    <li>✅ Правильный подсчет уникальных пользователей</li>
                    <li>✅ Различение новых и возвращающихся пользователей</li>
                    <li>✅ Отслеживание вовлеченности</li>
                    <li>✅ Сброс данных с подтверждением</li>
                    <li>✅ Типобезопасность</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
