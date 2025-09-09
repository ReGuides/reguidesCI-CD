'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ResetPreview {
  totalRecords: number;
  oldRecords: number;
  testRecords: number;
  recentRecords: number;
}

export default function AnalyticsReset() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ResetPreview | null>(null);
  const [resetType, setResetType] = useState<'all' | 'old' | 'test'>('old');
  const [daysToKeep, setDaysToKeep] = useState(30);
  const [confirmText, setConfirmText] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string; deletedCount?: number } | null>(null);

  const loadPreview = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/reset');
      const data = await response.json();
      
      if (data.success) {
        setPreview(data.data);
      } else {
        alert('Ошибка загрузки предварительного просмотра');
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      alert('Ошибка загрузки предварительного просмотра');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalytics = async () => {
    if (confirmText !== 'RESET') {
      alert('Введите "RESET" для подтверждения');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/analytics/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmReset: true,
          resetType,
          daysToKeep
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setPreview(null);
        setConfirmText('');
      }
    } catch (error) {
      console.error('Error resetting analytics:', error);
      setResult({ success: false, message: 'Ошибка сброса аналитики' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trash2 className="w-6 h-6 text-red-400" />
        <h3 className="text-xl font-semibold text-white">Сброс аналитики</h3>
      </div>

      {/* Предварительный просмотр */}
      <div className="mb-6">
        <button
          onClick={loadPreview}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Загрузка...' : 'Загрузить предварительный просмотр'}
        </button>

        {preview && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{preview.totalRecords}</div>
              <div className="text-sm text-neutral-400">Всего записей</div>
            </div>
            <div className="bg-neutral-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">{preview.oldRecords}</div>
              <div className="text-sm text-neutral-400">Старых записей</div>
            </div>
            <div className="bg-neutral-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{preview.testRecords}</div>
              <div className="text-sm text-neutral-400">Тестовых записей</div>
            </div>
            <div className="bg-neutral-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{preview.recentRecords}</div>
              <div className="text-sm text-neutral-400">Недавних записей</div>
            </div>
          </div>
        )}
      </div>

      {/* Настройки сброса */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Тип сброса
          </label>
          <select
            value={resetType}
            onChange={(e) => setResetType(e.target.value as 'all' | 'old' | 'test')}
            className="w-full h-10 rounded-md border border-neutral-600 bg-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="old">Удалить старые записи</option>
            <option value="test">Удалить тестовые записи</option>
            <option value="all">Удалить все записи</option>
          </select>
        </div>

        {resetType === 'old' && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Удалить записи старше (дней)
            </label>
            <input
              type="number"
              value={daysToKeep}
              onChange={(e) => setDaysToKeep(parseInt(e.target.value))}
              min="1"
              max="365"
              className="w-full h-10 rounded-md border border-neutral-600 bg-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Подтверждение (введите "RESET")
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="RESET"
            className="w-full h-10 rounded-md border border-neutral-600 bg-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Предупреждение */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <h4 className="text-red-400 font-semibold mb-2">Внимание!</h4>
            <p className="text-red-300 text-sm">
              {resetType === 'all' && 'Это действие удалит ВСЕ данные аналитики. Это действие необратимо!'}
              {resetType === 'old' && `Это действие удалит записи старше ${daysToKeep} дней. Это действие необратимо!`}
              {resetType === 'test' && 'Это действие удалит тестовые записи. Это действие необратимо!'}
            </p>
          </div>
        </div>
      </div>

      {/* Кнопка сброса */}
      <button
        onClick={resetAnalytics}
        disabled={loading || confirmText !== 'RESET'}
        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Сброс...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            Сбросить аналитику
          </>
        )}
      </button>

      {/* Результат */}
      {result && (
        <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
          result.success 
            ? 'bg-green-900/20 border border-green-500/30' 
            : 'bg-red-900/20 border border-red-500/30'
        }`}>
          {result.success ? (
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
          )}
          <div>
            <h4 className={`font-semibold mb-1 ${
              result.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.success ? 'Успешно!' : 'Ошибка!'}
            </h4>
            <p className={`text-sm ${
              result.success ? 'text-green-300' : 'text-red-300'
            }`}>
              {result.message}
              {result.deletedCount && ` (удалено записей: ${result.deletedCount})`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
